// namespace
this.Golem = this.Golem || {};

(function(window, undefined) {
    var Widget;
    if (Golem.Util.checkExists('Golem.UI')) {
        Widget = function() { };
        
        Golem.UI.Widget = Widget;
    }
}(this));