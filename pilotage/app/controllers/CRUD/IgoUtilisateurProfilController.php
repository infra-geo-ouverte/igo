<?php

class IgoUtilisateurProfilController extends ControllerBase
{
        public function newAction($r_controller = null, $r_action = null, $r_id = null) {
        if ($this->session->has("utilisateur_id")) {
            $this->tag->setDefault("utilisateur_id", $this->session->get("utilisateur_id"));
        }
                if ($this->session->has("profil_id")) {
            $this->tag->setDefault("profil_id", $this->session->get("profil_id"));
        }
        parent::newAction($r_controller, $r_action, $r_id);
    }
}
