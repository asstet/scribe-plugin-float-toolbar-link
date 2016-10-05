module.exports = function(toolbar) {
  return function(scribe) {

    var layout = '<input name="link" value="" placeholder="Ссылка..." /><button name="applyButton">Привязать</button>';
    var wrap = document.createElement('div');
    wrap.innerHTML = layout;
    wrap.className = 'link-block';
    wrap.style.display = 'none';
    wrap.style.position = 'absolute';
    wrap.style.top = '0';
    wrap.style.left = '0';
    wrap.style.backgroundColor = '#fff';
    wrap.style.borderRadius = '4px';

    toolbar.appendChild(wrap);

    wrap.addEventListener('click', handleLinkTooltopClick);
    window.addEventListener('mouseup', handleBodyClick);
    window.addEventListener('keyup', handleBodyClick);

    var linkCommand = new scribe.api.Command('createLink');
    linkCommand.nodeName = 'A';

    linkCommand.execute = function() {
      var selection = new scribe.api.Selection();
      this.range = selection.range;

      var anchorNode = selection.getContaining(function(node) {
        return node.nodeName === this.nodeName;
      }.bind(this));

      var initialLink = anchorNode ? anchorNode.href : '';

      if (anchorNode) {
        this.range.selectNode(anchorNode);
        selection.selection.removeAllRanges();
        selection.selection.addRange(this.range);
      }

      showLinkTooltip(initialLink);
    };

    linkCommand.queryState = function() {
      var selection = new scribe.api.Selection();
      return !! selection.getContaining(function(node) {
        return node.nodeName === this.nodeName;
      });
    };

    function showLinkTooltip(link) {
      wrap.style.display = 'block';
      toolbar.style.width = wrap.offsetWidth + 'px';
      wrap.querySelector('[name="link"]').value = link;
      setTimeout(function() {
        wrap.querySelector('[name="link"]').focus();
      }, 0);
    }

    function hideLinkTooltip() {
      wrap.style.display = 'none';
      toolbar.style.width = 'auto';
      wrap.querySelector('[name="link"]').value = '';
    }

    function createLink() {
      if (wrap.querySelector('[name="link"]').value !== '') {
        scribe.trigger('link:create', [wrap.querySelector('[name="link"]').value, linkCommand.range]);
      }

      hideLinkTooltip();
    }

    function handleBodyClick(e) {
      if (!wrap.contains(e.target) || e.code === 'Escape') {
        hideLinkTooltip();
      }

      if (e.code === 'Enter') {
        createLink();
      }
    }

    function handleLinkTooltopClick(e) {
      if (e.target.getAttribute('name') === 'applyButton') {
        createLink();
      }

      e.preventDefault();
    }

    scribe.on('link:create', function(link, range) {
      getSelection().removeAllRanges();
      getSelection().addRange(range);
      scribe.api.SimpleCommand.prototype.execute.call(linkCommand, link);
    });

    scribe.commands.linkTooltip = linkCommand;
  };
};
