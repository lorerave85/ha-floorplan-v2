import "https://unpkg.com/wired-card@2.1.0/lib/wired-card.js?module";
import {
    LitElement,
    html,
    css,
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";
import '/local/floorplan/lib/floor-panelV2.js'
import '/local/floorplan/lib/jquery-3.4.1.min.js'


class FloorPanelV2 extends LitElement {

    static get is() {
        return 'floor-panel-v2';
    }

    static get properties() {
        return {
            hass: {
                type: Object
            },
            narrow: {
                type: Boolean
            },
            route: {
                type: Object
            },
            panel: {
                type: Object
            },
        };
    }

    connectedCallback() {
        super.connectedCallback();

        if (!this.floorplan) {
            this.initFloorplan();
        }
    }

    stopPropagation(e) {
        e.stopPropagation();
    }

    initFloorplan() {
        this.floorplan = new Floorplan()
        let options = {
            root: this.renderRoot,
            hass: this.hass,
            openMoreInfo: this.openMoreInfo.bind(this),
            setIsLoading: this.setIsLoading.bind(this),
            config: this.panel.config
        }

        this.floorplan.init(options)
            .then(() => {
                this.setIsLoading(false);
            });

    }

    updated(changedProps) {
        if (changedProps.has("hass")) {
            const oldHass = changedProps.get("hass");
            this.floorplan.hassChanged(this.hass);
            //if (!oldHass || oldHass.language !== this.hass.language) {
            //    this.rtl = computeRTL(this.hass);
            //}
        }
    }

    hassChanged(newHass, oldHass) {
        if (this.floorplan) {
            this.floorplan.hassChanged(newHass, oldHass);
        }
    }

    //loadScript(scriptUrl) {
    //  return new Promise((resolve, reject) => {
    //    let script = document.createElement('script');
    //    script.src = this.cacheBuster(scriptUrl);
    //    script.onload = () => {
    //      return resolve();
    //    };
    //    script.onerror = (err) => {
    //      reject(new URIError(`${err.target.src}`));
    //    };
    //
    //    this.root.appendChild(script);
    //  });
    //}

    openMoreInfo(entityId) {
        this.fire('hass-more-info', {
            entityId: entityId
        });
    }

    setIsLoading(isLoading) {
        this.isLoading = isLoading;
    }

    cacheBuster(url) {
        return `${url}${(url.indexOf('?') >= 0) ? '&' : '?'}_=${new Date().getTime()}`;
    }

    logError(message) {
        console.error(message);

        let log = this.root.log;
        $(log).find('ul').prepend(`<li class="error">${message}</li>`)
        $(log).css('display', 'block');
    }

    fire(type, detail, options) {
        options = options || {};
        detail = (detail === null || detail === undefined) ? {} : detail;
        const event = new Event(type, {
            bubbles: options.bubbles === undefined ? true : options.bubbles,
            cancelable: Boolean(options.cancelable),
            composed: options.composed === undefined ? true : options.composed
        });
        event.detail = detail;
        const node = options.node || this;
        node.dispatchEvent(event);
        return event;
    }

    render() {
        return html `
        <ha-app-layout>
        <app-header slot="header" fixed>
          <app-toolbar>
            <ha-menu-button
              .hass=${this.hass}
              .narrow=${this.narrow}
            ></ha-menu-button>
            <div main-title>Floor Panel</div>
          </app-toolbar>
        </app-header>
 
        <div id="floorplan"></div>

      </ha-app-layout>
      
    `;
    }

    static get styles() {
        return 
            haStyle,
            css `

        .content {
          padding: 0 16px 16px;
        }
 
        .progress-wrapper {
          height: calc(100vh - 136px);
        }
 
        :host([narrow]) .progress-wrapper {
          height: calc(100vh - 198px);
        }
 
        ha-circular-progress {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }

        #floorplan {
            width: 100%;
            height: 100%;
          }
      `;
    }
}
customElements.define(FloorPanelV2.is, FloorPanelV2);