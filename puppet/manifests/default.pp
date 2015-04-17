# Configuration du serveur IGO

node default {

    class { 'ntp': }

    class { 'timezone':
        timezone => 'America/Montreal',
    }

    class { 'igo': }

}
