
define(['occurence'], function(Occurence) {
    function Cluster(geometrie, listeOccurences, proprietes, style, opt) {
        this.listeOccurences = listeOccurences;
        this._init(geometrie, proprietes, style, opt);
    }

    Cluster.prototype = Object.create(Occurence.prototype);
    Cluster.prototype.constructor = Cluster;

    Cluster.prototype.selectionner = function(tout) {
        if(tout){
            $.each(this.listeOccurences, function(key2, occ){
                if(!occ.estSelectionnee()){
                    occ.selectionner();
                }
            });
        }
        Occurence.prototype.selectionner.call(this);
    };
    
    Cluster.prototype.deselectionner = function(tout) {
        if(tout){
            $.each(this.listeOccurences, function(key2, occ){
                if(occ.estSelectionnee()){
                    occ.deselectionner();
                }
            });
        }
        Occurence.prototype.deselectionner.call(this);
    };
    
    return Cluster;
});
