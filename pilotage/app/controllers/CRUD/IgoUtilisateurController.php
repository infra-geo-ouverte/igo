<?php
class IgoUtilisateurController extends ControllerBase
{
    public function deleteAction($id,  $r_controller = null, $r_action = null, $r_id = null) {

        $igo_utilisateur = IgoUtilisateur::findFirst("id = $id");
        if($igo_utilisateur->nom == $this->session->get("info_utilisateur")->identifiant) {
            $this->flash->error("Vous ne pouvez pas supprimer votre propre compte utilisateur.");
            return $this->dispatcher->forward(array(
                                                    "controller" => $r_controller,
                                                    "action" => $r_action,
                                                    "params" => array($r_id)
                                                    ));
        } else {
            parent::deleteAction($id, $r_controller, $r_action, $r_id);
        }
    }
}
