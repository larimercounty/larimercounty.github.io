#-- [natural_resources_image_counts]
#--======================================
#--    - Pull image from Larimer County webcams located at Natural Resource areas.  Store and upload images and parquet file to S3 and write Tableau dataset.
#--
#--  04.23.2020 - gryskijr - created     
#--======================================

from common.tableau import tableau_utils
from common.utilities.etl_utils import ETL_Util
from etl.etl_base import ETL_Base
import argparse
import logging
import traceback
import cv2
import cvlib as cv
from cvlib.object_detection import draw_bbox
import matplotlib.pyplot as plt
import pandas as pd
import json
import urllib
import requests
import re
from bs4 import BeautifulSoup
import datetime
import os
import s3fs
import boto3
import numpy as np



class NaturalResourcesImageCounts(ETL_Base):
  
  def __init__(self, environment):
    '''
    +++++++++++++++++++++++++++++++++
    Set up a bunch of stuff
    +++++++++++++++++++++++++++++++++
    '''
    self.project_name = 'Natural Resources Image Counts'

    self.logger = logging.getLogger('natural_resources_image_counts')

    if environment == 'logging':
        self.logfile = '../../../log/' + self.project_name + '_' + datetime.datetime.now().strftime("%m-%d-%Y_%I-%M-%S_%p") + '.log'
    elif environment == 'development':
        self.tableau_username, self.tableau_password, self.source_token, self.source_db, self.tableau_server = ETL_Util.SystemUserAccess('Tableau','Dev', result_format='tuple', tuple_keys=['username', 'password', 'token', 'db', 'instance'])
        self.username, self.password, self.weather_api_key, self.db, self.weather_base_url = ETL_Util.SystemUserAccess('Open Weather Map','Prod', result_format='tuple', tuple_keys=['username', 'password', 'token', 'db', 'instance'])
    elif environment == 'test':
        self.tableau_username, self.tableau_password, self.source_token, self.source_db, self.tableau_server = ETL_Util.SystemUserAccess('Tableau','Test', result_format='tuple', tuple_keys=['username', 'password', 'token', 'db', 'instance'])
        self.username, self.password, self.weather_api_key, self.db, self.weather_base_url = ETL_Util.SystemUserAccess('Open Weather Map','Prod', result_format='tuple', tuple_keys=['username', 'password', 'token', 'db', 'instance'])
    elif environment == 'production':
        self.tableau_username, self.tableau_password, self.source_token, self.source_db, self.tableau_server = ETL_Util.SystemUserAccess('Tableau','Prod', result_format='tuple', tuple_keys=['username', 'password', 'token', 'db', 'instance'])
        self.username, self.password, self.weather_api_key, self.db, self.weather_base_url = ETL_Util.SystemUserAccess('Open Weather Map','Prod', result_format='tuple', tuple_keys=['username', 'password', 'token', 'db', 'instance'])
    else:
        self.logger.exception('An error occurred.  See below for details.')
        self.logger.exception('Invalid environment parameter - must specify development, test or production')
        raise Exception('Invalid environment parameter - must specify development, test or production')

    self.cwd = os.path.dirname(os.path.abspath(__file__))
    self.now = datetime.datetime.now()
    self.snapshot = self.now.strftime("%Y%m%d%H%M")
    
    self.local_image_folder = self.cwd+'\\images\\'
    self.local_image_count_folder = self.cwd+'\\images\\image_counts\\'
    self.local_image_processed_folder = self.cwd+'\\images\\processed\\'
    self.data_folder = self.cwd+'\\data'

    self.csv_file_name = 'parking_lot_counts.csv'
    self.parquet_file_name = 'parking_lot_counts.parquet'
    self.json_file_name = 'parking_lot_counts.json'
    
    self.local_parquet_file = self.data_folder + '\\' + self.parquet_file_name
    self.local_csv_file = self.data_folder + '\\' + self.csv_file_name

    self.bucket = 'larimer-county-data-lake'
    self.folder = 'Public/natural-resources'
    self.image_count_folder = self.folder+'/images/image_counts'
    self.processed_image_folder = self.folder+'/images/processed'

    self.tableau_data_source = 'Natural Resources - Parking Lot Counts'
    self.tableau_project = 'Data Sources'

    self.site_list = ['https://www.larimer.org/naturalresources/parks/devils-backbone', 'https://www.larimer.org/naturalresources/parks/horsetooth-mountain']
    self.image_remove_days = 7

    

  def pre(self):
    self.logger.info('pre')



  def run(self):
    self.logger.info('run')

    try:
        '''
        +++++++++++++++++++++++++++++++++
        Go get image from camera
        +++++++++++++++++++++++++++++++++
        '''
        self.stage_image()

        counts = []
        
        images = os.listdir(self.local_image_folder)  #create list with everything in local image folder (but doesn't delet old images)

        '''
        +++++++++++++++++++++++++++++++++
        read parquet file from S3 to get history.
        +++++++++++++++++++++++++++++++++
        '''
        df_parquet = pd.read_parquet('s3://{}/{}/{}'.format(self.bucket,self.folder,self.parquet_file_name))  #pull down "parking_lot_counts" parquet from s3

        for image_file in images:


            if os.path.isfile(self.local_image_folder+image_file):
                #print(os.stat(self.local_image_folder+image_file).st_size)
                location = image_file.split('_')[0]
                snapshot = image_file.split('_')[-1]
                snapshot = datetime.datetime.strptime(snapshot.split('.')[0], '%Y%m%d%H%M')


                if location == 'horsetooth-mountain':
                    weather_lat = '40.5321099'
                    weather_long = '-105.2120084'
                    lat_deg = '40'
                    lat_min = '31'
                    lat_sec = '55.596'
                    lon_deg = '-105'
                    lon_min = '12'
                    lon_sec = '43.2282'
                    max_parking = 35
                elif location == 'devils-backbone':
                    weather_lat = '40.4033971'
                    weather_long = '-105.1413873'
                    lat_deg = '40'
                    lat_min = '24'
                    lat_sec = '12.2286'
                    lon_deg = '-105'
                    lon_min = '8'
                    lon_sec = '28.9926'
                    max_parking = 27

                '''
                +++++++++++++++++++++++++++++++++
                Get weather for both sites.
                +++++++++++++++++++++++++++++++++
                '''
                weather_url = '{}?lat={}&lon={}&APPID={}&units=imperial'.format(self.weather_base_url, weather_lat, weather_long, self.weather_api_key)
                weather_data = json.loads(urllib.request.urlopen(weather_url).read().decode())
                current_temp = weather_data["main"]["temp"]
                current_humidity = weather_data["main"]["humidity"]
                current_weather = weather_data["weather"][0]["description"]


                '''
                +++++++++++++++++++++++++++++++++
                Image recognition ... Machine Learning magic
                +++++++++++++++++++++++++++++++++
                '''
                im = cv2.imread(self.local_image_folder+image_file)  #reads image, creates "im" object
                bbox, label, conf = cv.detect_common_objects(im)  #gives box coordinates, labels, confidence scores to objects in image
                output_image = draw_bbox(im, bbox, label, conf)  # outputs image with boxes

                image_count_file = self.local_image_count_folder+location+'_count.jpg'  # Names count file
                plt.imsave(image_count_file,output_image) # Saves output image with file name just created
                ETL_Util.UploadFileS3(image_count_file,self.bucket,self.image_count_folder,'public','jpg')  # Uploads to s3 as jpg

                ## uncomment to see image of counts 
                #plt.imshow(output_image)
                #plt.show()
                ##
                
                vehicle = label.count('car') + label.count('truck') + label.count('bus') + label.count('motorcycle')
                pct_parking_used = (vehicle / max_parking) * 100

                dictlist = {
                        'snapshot_datetime': snapshot
                        , 'filename': image_file
                        , 'location': location
                        , 'temperature': current_temp
                        , 'humidity': current_humidity
                        , 'weather': current_weather
                        , 'car': label.count('car')
                        , 'truck': label.count('truck')
                        , 'bus': label.count('bus')
                        , 'motorcycle': label.count('motorcycle')
                        , 'people': label.count('person')
                        , 'total_vehicle': vehicle
                        , 'max_parking': max_parking
                        , 'pct_parking_used': pct_parking_used
                        }


                counts.append(dictlist) 

                processed_image_file = self.local_image_processed_folder+image_file
                os.rename(self.local_image_folder+image_file, processed_image_file)  #for each image
                ETL_Util.UploadFileS3(processed_image_file, self.bucket, self.processed_image_folder,'public','jpg')
                

        if counts:
            df = pd.DataFrame(counts)
            df['snapshot_date'] = pd.to_datetime(df['snapshot_datetime'], format='%Y:%M:%D').dt.date
            df['snapshot_time'] = pd.to_datetime(df['snapshot_datetime'], format='%H:%M')  #.dt.time
            df['snapshot_day_number'] = pd.to_datetime(df['snapshot_datetime'], format='%Y:%M:%D').dt.dayofweek
            df['snapshot_day'] = pd.to_datetime(df['snapshot_datetime'], format='%Y:%M:%D').dt.day_name()
            
            df.loc[df['snapshot_day_number'] >= 5 , 'snapshot_isweekend'] = True
            df.loc[df['snapshot_day_number'] < 5 , 'snapshot_isweekend'] = False

            df['snapshot_hour'] = pd.to_datetime(df['snapshot_datetime']).dt.hour
            df['snapshot_time_category'] = pd.cut(df['snapshot_hour'], bins=[0,8,12,16,20], include_lowest=True, labels=['Early Morning (before 8am)','Morning (8am-12pm)','Afternoon (12pm-4pm)','Early Evening (4pm-8pm)'])
            df['temperature_category'] = pd.cut(df['temperature'], bins=[0,30,35,40,45,50,55,60,65,70,75,80,85,90], labels=['<30','30-35','35-40','40-45','45-50','50-55','55-60','60-65','65-70','70-75','75-80','80-85','85-90'], include_lowest=True, right=False)
            
            df['weather_category'] = pd.Categorical(df['weather'], categories = ['clear sky','haze','few clouds','broken clouds','scattered clouds','overcast clouds','mist','light rain','moderate rain','rain','heavy rain','light snow','snow','heavy snow'], ordered = True)
            df['weather_code'] = df.weather_category.cat.codes

            df.set_index('snapshot_datetime')
            df.to_csv(self.local_csv_file, mode='a', header=False, index=False)

                      
            frames = [df_parquet,df]
            df_parquet = pd.concat(frames)
            df_parquet['snapshot_datetime'] = df_parquet['snapshot_datetime'].astype(str)
            df_parquet['snapshot_date'] = df_parquet['snapshot_date'].astype(str)
            df_parquet['snapshot_time'] = df_parquet['snapshot_time'].astype(str)

            

            df_parquet.to_parquet(self.local_parquet_file, compression='gzip')


            #create append file:
            df_json = df
            # Ensure datetimes are correct so they can be compared to timedelta:
            df_json['snapshot_datetime'] = pd.to_datetime(df_json['snapshot_datetime'])

            #take down json from s3
            #bigFile = pd.read_json('s3://{}/{}/{}'.format(self.bucket,self.folder,'parking_lot_counts_test.json'), orient='records')   # for testing
            bigFile = pd.read_json('s3://{}/{}/{}'.format(self.bucket,self.folder,'parking_lot_counts_historical.json'), orient='records')   
            
            #Change field to datetime for comparison purposes (see two lines below):
            bigFile['snapshot_datetime'] = pd.to_datetime(bigFile['snapshot_datetime'])  #Change 'snapshot_datetime' from str to datetime
            #bigFile.to_csv("C:\\file_from_s3.csv")  #for testing            

            #append new data (df_json):
            bigFile = bigFile.append(df_json, ignore_index=True) 
            #bigFile.to_csv("C:\\appendedBigFile.csv")  #for testing   

            #
            bigFileDevil = bigFile[bigFile['location'] == 'devils-backbone']
            bigFileHorse = bigFile[bigFile['location'] == 'horsetooth-mountain']

            #Create a date 30 days previous:
            limitDate = np.datetime64('today') - np.timedelta64(28, 'D')

            #S3 file cut at >=  30 days ago for abbreviated file
            abbFileDevil = bigFileDevil[bigFileDevil['snapshot_datetime'] >=  limitDate] 
            abbFileHorse = bigFileHorse[bigFileHorse['snapshot_datetime'] >=  limitDate] 
            abbFile = bigFile[bigFile['snapshot_datetime'] >=  limitDate] 


            
            # abbFile.to_csv("C:\\abb_file_to_be_sent.csv")  #for testing
            # bigFile.to_csv("C:\\file_to_be_sent.csv")  #for testing

            #Convert datetimes to strings:
            #(Last set will not be necessary after Jim repoints to the "broken out" files)


            abbFileDevil['snapshot_date'] = abbFileDevil['snapshot_datetime'].apply(lambda x: x.strftime("%b/%d/%Y"))
            abbFileDevil['snapshot_time'] = abbFileDevil['snapshot_datetime'].apply(lambda x: pd.to_datetime(x).strftime("%H:%M"))   ### formerly:  .apply(lambda x: x.strftime("%H:%M"))
            abbFileDevil['snapshot_datetime'] = abbFileDevil['snapshot_datetime'].apply(lambda x: x.strftime("%b/%d/%Y %H:%M"))

            abbFileHorse['snapshot_date'] = abbFileHorse['snapshot_datetime'].apply(lambda x: x.strftime("%b/%d/%Y"))
            abbFileHorse['snapshot_time'] = abbFileHorse['snapshot_datetime'].apply(lambda x: pd.to_datetime(x).strftime("%H:%M"))   ### formerly:  .apply(lambda x: x.strftime("%H:%M"))
            abbFileHorse['snapshot_datetime'] = abbFileHorse['snapshot_datetime'].apply(lambda x: x.strftime("%b/%d/%Y %H:%M"))
            
            bigFile['snapshot_date'] = bigFile['snapshot_datetime'].apply(lambda x: x.strftime("%b/%d/%Y"))
            bigFile['snapshot_time'] = bigFile['snapshot_datetime'].apply(lambda x: pd.to_datetime(x).strftime("%H:%M"))
            bigFile['snapshot_datetime'] = bigFile['snapshot_datetime'].apply(lambda x: x.strftime("%b/%d/%Y %H:%M"))
            #To be removed when broken-out files are pointed to:
            abbFile['snapshot_date'] = abbFile['snapshot_datetime'].apply(lambda x: x.strftime("%b/%d/%Y"))
            abbFile['snapshot_time'] = abbFile['snapshot_datetime'].apply(lambda x: pd.to_datetime(x).strftime("%H:%M"))   ### formerly:  .apply(lambda x: x.strftime("%H:%M"))
            abbFile['snapshot_datetime'] = abbFile['snapshot_datetime'].apply(lambda x: x.strftime("%b/%d/%Y %H:%M"))

            #Write dfs to json files:

            # abbFileDevil.to_csv("C:\\abbFileDevil.csv")  #for testing
            # abbFileHorse.to_csv("C:\\abbFileHorse.csv")  #for testing
            # bigFile.to_csv("C:\\file_to_be_sent.csv")  #for testing

            abbFileDevil.to_json('devilsBB_counts_short.json',orient='records') 
            abbFileHorse.to_json('horsetooth_counts_short.json',orient='records')     
            bigFile.to_json('parking_lot_counts_historical.json',orient='records') 
            abbFile.to_json('parking_lot_counts.json',orient='records')  #To be removed when repoint to broken-out files happens.


            #upload json file to s3:
            '''
            +++++++++++++++++++++++++++++++++
            Write to S3
            +++++++++++++++++++++++++++++++++
            '''
            ETL_Util.UploadFileS3('devilsBB_counts_short.json',self.bucket,self.folder,'public','json')  #for testing
            ETL_Util.UploadFileS3('horsetooth_counts_short.json',self.bucket,self.folder,'public','json')  #for testing
            ETL_Util.UploadFileS3('parking_lot_counts_historical.json',self.bucket,self.folder,'public','json')
            ETL_Util.UploadFileS3('parking_lot_counts.json',self.bucket,self.folder,'public','json')
            #ETL_Util.UploadFileS3('parking_lot_counts_test.json',self.bucket,self.folder,'public','json')  #for testing

            #upload .csv and .parquet files:
            ETL_Util.UploadFileS3(self.local_csv_file, self.bucket, self.folder,'public','csv')
            ETL_Util.UploadFileS3(self.local_parquet_file, self.bucket, self.folder,'public','parquet')

            # Tableau data source
            df_tableau = df_parquet
            df_parquet['snapshot_date'] = pd.to_datetime(df_parquet['snapshot_date'])
            df_parquet['snapshot_datetime'] = pd.to_datetime(df_parquet['snapshot_datetime'])

            tu = tableau_utils.TableauUtil(self.tableau_server, self.tableau_username, self.tableau_password)
          
            project_id = tu.get_project_id(self.tableau_project)
            # Move it to the Tableau server
            ds_id = tu.publish_dataframe(project_id, self.tableau_data_source, df_tableau)    



    except Exception as e:
        self.logger.exception('The following error occurred: {}  See below for details.'.format(e))
        self.error_callstack = traceback.format_exc()[0:4000]


  def stage_image(self):
    '''
      stage_image :: Grab image from Larimer County webcams and saves to local for object recognition
    '''
    self.logger.info('Stage Image')

    for site in self.site_list:

      html = urllib.request.urlopen(site)

      name = site.split('/')[-1]  # either horsetooth-mountain or devils-backbone

      bs = BeautifulSoup(html, 'html.parser')  #turns our html into parseable object

      images = bs.find_all('img', {'src':re.compile('.jpg')})  #in that parseable object find image tags containing .jpg sources




      for image in images: 
          if 'weathercam' in image['src']:
            url = image['src']
            print(url)  #should give me the two camera urls
            r = requests.get(url)

            
            outfile = '{}{}_{}.jpg'.format(self.local_image_folder, name, self.snapshot) #so this would be in images/horsetooth-mountain or images/devils-backbone
            if name == 'horsetooth-mountain':
                if int(self.now.strftime("%H%M")) >= 700:
                    with open(outfile, 'wb') as f:
                        f.write(r.content)
            else:
                with open(outfile, 'wb') as f:
                    f.write(r.content)

            ETL_Util.UploadFileS3(outfile,'larimer-county-data-lake','Public/natural-resources/images','public','jpg')  


  def post(self):
    self.logger.info('post')

    '''
      Clean up local processed images >X days old.

    '''
    processed_images = os.listdir(self.local_image_processed_folder)

    for image_file in processed_images:
      if datetime.datetime.fromtimestamp(os.stat(self.local_image_processed_folder+image_file).st_mtime) < self.now - datetime.timedelta(days = self.image_remove_days):
        if os.path.isfile(self.local_image_processed_folder+image_file):
          os.remove(self.local_image_processed_folder+image_file)


  def verify(self):
    self.logger.info('verify')





if __name__ == '__main__':
    logfile = NaturalResourcesImageCounts('logging').logfile
    logging.basicConfig(level=logging.INFO, format='%(name)s :: %(asctime)s :: %(levelname)s :: %(message)s') #,handlers=[logging.FileHandler(logfile),logging.StreamHandler()])

    parser = argparse.ArgumentParser(description="Collect image counts and write to S3 and Tableau dataset")
    parser.add_argument('-e', '--environment', default='development', help='Specify development, test or production environment.')
    args = parser.parse_args()

    a = NaturalResourcesImageCounts(args.environment)
    a.pre()
    a.run()
    a.post()
    a.verify()
