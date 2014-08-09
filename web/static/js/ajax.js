function AjaxViewModel() {
    var self = this;

    self.History = window.History;

    self.manualStateChange = true;

    History.Adapter.bind(window, 'statechange', function () {
        if (self.manualStateChange == true) {
            window.location.reload();
        }
        self.manualStateChange = true;
    });

    self.bind = function () {
        var ajaxButtons = document.querySelectorAll('a');
        for (var i = 0; i < ajaxButtons.length; i++) {
            var ajaxButton = ajaxButtons[i];
            var url = new URL(ajaxButton.href).hostname;
            if (url == window.location.hostname) {
                ajaxButton.addEventListener('click', self.click, false);
            }
        }
    }

    self.click = function (e) {
        if (!self.History.enabled) {
            console.log('history disabled');
            return true;
        }

        var url = this.href;

        self.preUpdate();
        self.getData(url);
        self.manualStateChange = false;

        e = e || window.event
        e.preventDefault ? e.preventDefault() : (e.returnValue = false)
    }

    self.getData = function (url) {
        self.preUpdate();

        $.getJSON(url, {_ajax: true}, function (response) {
            if (response.success) {
                self.update(response, url);
            }
            self.postUpdate(response);
        });
    }

    self.preUpdate = function () {
        document.body.style.opacity = 0.2;
    }

    self.update = function (response, href) {
        self.History.pushState({href: href}, response.title, href);

        var main = document.getElementById('main');
        main.innerHTML = response.html;
        self.forceRedraw(main);
    }

    self.postUpdate = function (response) {
        var rotation = new Rotation();
        rotation.init();

        self.bind();

        setTimeout(initFancybox, 50);

        $('html,body').animate({
            scrollTop: 0
        }, 300);

        document.body.style.opacity = 1;

        if (response) {
            if (response.bodyClass) {
                document.body.classList = null;
                document.body.classList.add(response.bodyClass);
            }
        }
    }

    self.forceRedraw = function (element) {
        if (!element) {
            return;
        }

        var n = document.createTextNode(' ');
        var disp = element.style.display;  // don't worry about previous display style

        element.appendChild(n);
        element.style.display = 'none';

        setTimeout(function () {
            element.style.display = disp;
            n.parentNode.removeChild(n);
        }, 50);
    }

}

var Ajax = new AjaxViewModel();

onReady(function () {
    Ajax.bind();
});