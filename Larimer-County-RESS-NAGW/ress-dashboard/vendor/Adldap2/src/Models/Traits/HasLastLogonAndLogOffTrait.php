<?php

namespace Adldap\Models\Traits;

use Adldap\Schemas\Schema;

trait HasLastLogonAndLogOffTrait
{
    /**
     * Returns the models's last log off date.
     *
     * https://msdn.microsoft.com/en-us/library/ms676822(v=vs.85).aspx
     *
     * @return string
     */
    public function getLastLogOff()
    {
        return $this->getAttribute(Schema::get()->lastLogOff(), 0);
    }

    /**
     * Returns the models's last log on date.
     *
     * https://msdn.microsoft.com/en-us/library/ms676823(v=vs.85).aspx
     *
     * @return string
     */
    public function getLastLogon()
    {
        return $this->getAttribute(Schema::get()->lastLogOn(), 0);
    }

    /**
     * Returns the models's last log on timestamp.
     *
     * https://msdn.microsoft.com/en-us/library/ms676824(v=vs.85).aspx
     *
     * @return string
     */
    public function getLastLogonTimestamp()
    {
        return $this->getAttribute(Schema::get()->lastLogOnTimestamp(), 0);
    }
}
