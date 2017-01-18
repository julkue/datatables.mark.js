/*!***************************************************
 * datatables.mark.js v2.0.0
 * https://github.com/julmot/datatables.mark.js
 * Copyright (c) 2016–2017, Julian Motz
 * Released under the MIT license https://git.io/voRZ7
 *****************************************************/
/**
 * Initializes mark.js on the specified DataTables instance
 */
class Mark_DataTables {

    /**
     * @param  {object} dtInstance - A DataTables instance
     * @param  {object} [options] - mark.js options
     */
    constructor(dtInstance, options) {
        if(typeof $.fn.mark !== "function" || typeof $.fn.unmark !== "function") {
            throw new Error(
                "jquery.mark.js is necessary for datatables.mark.js"
            );
        }
        this.instance = dtInstance;
        this.options = typeof options === "object" ? options : {};
        this.intervalThreshold = 49;
        this.intervalMs = 300;
        this.initMarkListener();
    }

    /**
     * Hooks into DataTables init events to call {@link Mark_DataTables#mark}
     */
    initMarkListener() {
        const ev = "draw.dt.dth column-visibility.dt.dth column-reorder.dt.dth";
        let intvl = null;
        this.instance.on(ev, () => {
            // mark matches directly or after a specific time if there are more
            // rows than the thresold
            const rows = this.instance.rows({
                filter: "applied",
                page: "current"
            }).nodes().length;
            if(rows > this.intervalThreshold) {
                clearTimeout(intvl);
                intvl = setTimeout(() => {
                    this.mark();
                }, this.intervalMs);
            } else {
                this.mark();
            }
        });
        this.instance.on("destroy", () => {
            // remove listener
            this.instance.off(ev);
        });
        this.mark();
    }

    /**
     * Iterates over all instance table columns and marks column specific
     * search terms. If there aren't any, it tries to mark global search
     * terms
     */
    mark() {
        const globalSearch = this.instance.search();
        $(this.instance.table().body()).unmark(this.options);
        this.instance.columns({
            search: "applied",
            page: "current"
        }).nodes().each((nodes, colIndex) => {
            const columnSearch = this.instance.column(colIndex).search(),
                searchVal = columnSearch || globalSearch;
            if(searchVal) {
                nodes.forEach(node => {
                    $(node).mark(searchVal, this.options);
                });
            }
        });
    }

}

// hook into all DataTables initializations
$(document).on("init.dt.dth", (event, settings) => {
    // check if the event was triggered from DataTables
    if(event.namespace !== "dt") {
        return;
    }
    // get DataTables table instance by settings object containing the unique
    // table id
    const dtInstance = $.fn.dataTable.Api(settings);
    // check if mark.js is enabled for this instance or by default
    let options = null;
    if(dtInstance.init().mark) {
        options = dtInstance.init().mark;
    } else if($.fn.dataTable.defaults.mark) {
        options = $.fn.dataTable.defaults.mark;
    }
    if(options === null) {
        return;
    }
    // initialize plugin instance
    new Mark_DataTables(dtInstance, options);
});
