Effect.SlideRightIntoView = function(element) {
  $(element).style.width = '0px';
  $(element).style.overflow = 'hidden';
  $(element).firstChild.style.position = 'relative';
  Element.show(element);
  new Effect.Scale(element, 100,
    { scaleContent: false,
      scaleY: false,
      scaleMode: 'contents',
      scaleFrom: 0,
      afterUpdate: function(effect)
        { effect.element.firstChild.style.width =
            (effect.originalWidth - effect.element.clientWidth) + 'px'; }
    }.extend(arguments[1] || {})
  );
}

Effect.SlideRightOutOfView = function(element) {
  $(element).style.overflow = 'hidden';
  $(element).firstChild.style.position = 'relative';
  Element.show(element);
  new Effect.Scale(element, 0,
    { scaleContent: false,
      scaleY: false,
      afterUpdate: function(effect)
        { effect.element.firstChild.style.width =
            (effect.originalWidth - effect.element.clientWidth) + 'px'; },
      afterFinish: function(effect)
        { Element.hide(effect.element); }
    }.extend(arguments[1] || {})
  );
}