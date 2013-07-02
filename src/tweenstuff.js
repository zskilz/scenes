define(function() {

  var mainGUI, transitionGUI, quequeing;
  var Tweenz = [],
    loadedTweenz = (typeof(localStorage['Tweenz']) === 'undefined') ? [] : JSON.parse(localStorage['Tweenz']);

  //build TWEEN selects
  var easings = {};
  Object.keys(TWEEN.Easing).forEach(function(family) {
    Object.keys(TWEEN.Easing[family]).forEach(function(direction) {
      var name = family + '.' + direction;
      easings[name] = name;
    });
  });

  function setupTween(current, target, obj, params, easing, doneTween) {

    var update = function() {
      $.each(current, function(k, v) {
        if (typeof(obj[k]) !== 'boolean') obj[k] = v;
      });
    };
    var tween = new TWEEN.Tween(current).to(target, params.duration * 1000.0).easing(easing).onUpdate(update).onComplete(doneTween);
    // start
    tween.start();
  }

  function setupTweenz(params) {
    // 
    var presets = (mainGUI.load).remembered;
    var currentSet = $.extend(true, {}, presets[params.from]);
    var targetSet = $.extend(true, {}, presets[params.to]);

    $(mainGUI.__preset_select).val(params.from);
    mainGUI.preset = params.from;

    // remove previous Tweenz if needed
    TWEEN.removeAll();

    // convert the string from dat-gui into tween.js functions 
    var easing = TWEEN.Easing[params.easing.split('.')[0]][params.easing.split('.')[1]];
    easing = (typeof(easing) === 'undefined') ? TWEEN.Easing.Linear.None : easing;
    // stuff to do when done..
    var done = false;

    function doneTween() {
      if (!done) {

        done = true;
        quequeing = false;
        $(mainGUI.__preset_select).val(params.to);
        mainGUI.preset = params.to;
      }

    }
    // build the tween 
    for (var i in currentSet) {
      var current = currentSet[i];
      var target = targetSet[i];
      if (target) {
        var obj = mainGUI.__rememberedObjects[i];
        setupTween(current, target, obj, params, easing, doneTween);
      }
    }
  }

  function addTweenGUI(params) {
    var newTweenGUI = transitionGUI.addFolder(params.name);
    var oldName = params.name;

    newTweenGUI.add(params, 'name').onFinishChange(function(value) {
      addTweenGUI(params);

      delete transitionGUI.__folders[oldName];
      $(newTweenGUI.domElement).remove();
      delete newTweenGUI;
      oldName = value;
    });
    newTweenGUI.add(params, 'from', Object.keys((mainGUI.load).remembered));
    newTweenGUI.add(params, 'to', Object.keys((mainGUI.load).remembered));
    newTweenGUI.add(params, 'easing', easings);
    newTweenGUI.add(params, 'duration', 0, 120).step(0.01);
    newTweenGUI.add(params, 'start');
    newTweenGUI.add({
      delete: function() {
        var conf = confirm("Are you sure you want to delete this transition?");
        if (conf == true) {
          Tweenz.splice(Tweenz.indexOf(params), 1);
          delete transitionGUI.__folders[params.name];
          $(newTweenGUI.domElement).remove();
          delete newTweenGUI;
        }
      }
    }, 'delete');
  }

  function addNewTween(params) {
    var newTweenParams = {
      name: 'new transition',
      from: 'Default',
      to: 'Default',
      easing: 'Linear',
      duration: 2.0,
      start: function() {
        setupTweenz(newTweenParams);
      }
    };
    $.extend(newTweenParams, params);
    addTweenGUI(newTweenParams);
    Tweenz.push(newTweenParams);
  }

  function initTweenz(gui, maingui) {
    //thing to snoop on transitions...?
    transitionGUI = gui;
    mainGUI = maingui;


    transitionGUI.add({
      add: addNewTween
    }, 'add').name('Add a transition');

    //setup 'saved' transitions
    for (var i in loadedTweenz) addNewTween(loadedTweenz[i]);

  }

  var _export = {
    initTweenz: initTweenz,
    Tweenz: Tweenz,
    save: function() {
      localStorage['Tweenz'] = JSON.stringify(Tweenz);
    },
    queNext: function() {
      if (!quequeing) {
        quequeing = true;
        var quedThing = $('#quequeList').find('.quequed');
        if (quedThing.length == 0) $('#quequeList').find('li:first').find('.playBtn').click();
        else quedThing.removeClass('quequed').next().addClass('.quequed').find('.playBtn').click();
      }
    }
  }

  return _export;
})