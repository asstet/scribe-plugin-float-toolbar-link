module.exports = function(toolbar) {
  return function(scribe) {

    var layout = '<input name="link" value="" /><button name="applyButton">Apply</button><button name="cancelButton">Cancel</button>';
    var wrap = document.createElement('div');
    wrap.innerHTML = layout;
    wrap.className = 'link-block';
    wrap.style.display = 'none';
    wrap.style.position = 'absolute';
    wrap.style.top = '0';
    wrap.style.left = '0';

    toolbar.appendChild(wrap);


    wrap.addEventListener('click', handleLinkTooltopClick);
    window.addEventListener('mouseup', handleBodyClick);
    window.addEventListener('keyup', handleBodyClick);

    var linkCommand = new scribe.api.Command('createLink');
    linkCommand.nodeName = 'A';

    linkCommand.execute = function () {
      var selection = new scribe.api.Selection();
      this.range = selection.range;

      var anchorNode = selection.getContaining(function (node) {
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

    linkCommand.queryState = function () {
      var selection = new scribe.api.Selection();
      return !! selection.getContaining(function (node) {
        return node.nodeName === this.nodeName;
      });
    };

    function showLinkTooltip(link) {
      wrap.style.display = 'block';
      wrap.querySelector('[name="link"]').value = link;
    }

    function hideLinkTooltip() {
      wrap.style.display = 'none';
      wrap.querySelector('[name="link"]').value = '';
    }

    function handleBodyClick(e) {
      if (!wrap.contains(e.target)) {
        hideLinkTooltip();
      };
    }

    function handleLinkTooltopClick(e) {
      if (e.target.getAttribute('name') == 'cancelButton') {
        hideLinkTooltip();
      };

      if (e.target.getAttribute('name') == 'applyButton') {
        scribe.trigger('link:create', [wrap.querySelector('[name="link"]').value, linkCommand.range]);

        hideLinkTooltip();
      };


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
