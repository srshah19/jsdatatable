/**
 * Initialize a Table constructor.
 * @param opts {'pageSize', 'headers'} etc can be passed while making new constructor function
 * @constructor new Table(opts)
 */
var Table = function (opts) {
    // If multiple tables in page, elem can be passed and all logic to create can be done on that elem
    // (each table can be an element)
    var table = document.getElementsByTagName("table")[0];
    var tHead = document.getElementsByTagName("thead")[0];
    var tHeadRow = tHead.getElementsByTagName("tr")[0];

    opts = opts || {};
    this.tableHeaders = opts.headers || []; // Headers can be passed either via opts or via html data
    this.pageSize = opts.pageSize || 5; //Default page size is 5
    this.currentPage = 1; // Set default current page to 1
    this.toggleDirection = "asc";

    var data = opts.data || [];
    var self = this;


    // Setting a property 'data' on the Table
    Object.defineProperty(this, 'data', {
        get: function () {
            return data;
        },
        set: function (val) {
            data = val;
            self.create();
        }
    });

    // If header is defined in html data and not passed as opts, create an array from the data-attribute
    if (tHeadRow && !opts.headers) {
        var headerArr = tHeadRow.getElementsByTagName("th");
        for (var a = 0; a < headerArr.length; a++) {
            // Case sensitive name. Need to fix.
            this.tableHeaders.push(headerArr[a].dataset.name);
        }
    }
    table.appendChild(document.createElement("tbody"));
    this.create();
};

/**
 * Create function to create a new table
 */
Table.prototype.create = function () {
    // Adding headers from JS
    // hard coded tables for this project. In prod, we can pass the elem as a param and do all checks based on that.
    var table = document.getElementsByTagName("table")[0];
    var tHeader = document.getElementsByTagName("thead")[0];
    tHeader.innerHTML = "";
    var self = this;
    var thRow = document.createElement("tr");

    /*
    Creating a set of table headers from the opts.header and binding an onclick function
    that allows sorting when header is clicked.
     */
    for(var h =0; h< this.tableHeaders.length; h++){
        var thHead = document.createElement("th");
        var atLink = document.createElement("a");
        atLink.innerText = this.tableHeaders[h];
        // Binding the val of h to tableSort
        atLink.onclick = function (x) {
            self.tableSort(this.tableHeaders[x] );
        }.bind(this, h);
        thHead.appendChild(atLink);
        thRow.appendChild(thHead);
    }
    tHeader.appendChild(thRow);
    table.insertBefore(tHeader, table.childNodes[0]);

    // Reset the table body when creating
    var tbody = document.getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";
    var test = this.data.slice((this.currentPage - 1) * this.pageSize, this.data.length);
    var currCount = test.length; // Setting the number of rows that are to be shown in the page
    if (this.pageSize < test.length) {
        currCount = this.pageSize;
    }
    /**
     * Setting the Pagination
     */
    // If pagination elem does not exist, create
    if (!this.paginationElement) {
        this.paginationElement = document.createElement("ul");
    }
    this.paginationElement.className = "pagination";
    this.paginationElement.innerHTML = '';

    /*
    Create the list of table body elements (tr and td's) that will be appended
    based on the header length.
     */
    for (var i = 0; i < currCount; i++) {
        var tRow = document.createElement("tr");
        var row = [];
        // Based on the pageSize and remaining/available data, we loop over the sliced data.
        var pagedData = this.data.slice((this.currentPage - 1) * this.pageSize, this.data.length);
        for (var j = 0; j < this.tableHeaders.length; j++) {
            if (pagedData[i][this.tableHeaders[j]]) {
                row.push(pagedData[i][this.tableHeaders[j]]);
            }
            else {
                row.push("");
            }
        }

        for (var j = 0; j < row.length; j++) {
            var cell = document.createElement("td");
            cell.setAttribute("contenteditable", true);
            var cellText = document.createTextNode(row[j]);
            cell.appendChild(cellText);
            tRow.appendChild(cell);
        }
        tbody.appendChild(tRow);
    }

    /*
    Binding the page numbers to the pagination elems so when clicked, they will call the this.page() function.
     */
    for (var i = 0; i < (Math.ceil(this.data.length / this.pageSize) || 1); i++){
        var link = document.createElement("li");
        var aLink = document.createElement("a");
        link.appendChild(aLink);
        aLink.innerHTML = i + 1;
        // Binding the value of i to pass within closure and set the onclick
        aLink.onclick = function (x) {
            self.page( x + 1);
        }.bind(this, i);

        self.paginationElement.appendChild(link);
    }
    // Appending the pagination div to the 'pagination-row' class
    document.getElementsByClassName("pagination-row")[0].appendChild(this.paginationElement);
};

/**
 * Table Pagination
 * @param n - page number
 */
Table.prototype.page = function (n) {
    // When pagination elem is clicked, set Current page to that number and create table
    this.currentPage = n || 1;
    this.create();
};

/**
 * Table Sorting
 * @param sortBy - column name (case sensitive)
 */
Table.prototype.tableSort = function (sortBy) {
    /* Based on sort direction */
    switch (this.toggleDirection) {
        case "asc":
            this.data = this.data.sort(function (a, b) {
                return (a[sortBy] > b[sortBy]) ? 1 : ((b[sortBy] > a[sortBy]) ? -1 : 0);
            });
            this.toggleDirection = "desc";
            break;
        case "desc":
            this.data = this.data.sort(function (a, b) {
                return (a[sortBy] < b[sortBy]) ? 1 : ((b[sortBy] < a[sortBy]) ? -1 : 0);
            });
            this.toggleDirection = "asc";
            break;
        default:
            return this.data;
    }
    this.create();
};

/**
 * Table search.
 * Can be improved to make a new search array and build table from that rather than this.data
 */
Table.prototype.search = function () {
    // Make this better by manipulating the data array instead of simple show/hide.
    // Currently it wont do anything with data. not reliable.
    var filter, found, table, tr, td, i, j;
    var str = document.getElementById("searchInput").value;
    filter = str.toUpperCase();

    // Again, hard coded for this project. In prod, we can pass the elem as a param and do all checks based on that.
    table = document.getElementById("beTable");
    tr = table.getElementsByTagName("tr");
    if (str.length > 0) {
        for (i = 1; i < tr.length; i++) {
            td = tr[i].getElementsByTagName("td");
            for (j = 0; j < td.length; j++) {
                if (td[j].innerHTML.toUpperCase().indexOf(filter) > -1) {
                    found = true;
                }
            }
            if (found) {
                tr[i].style.display = "";
                found = false;
            } else {
                tr[i].style.display = "none";
            }
        }
        this.paginationElement.style.display = "none";
    } else {
        this.paginationElement.style.display = "inline-block";
        this.create();
    }
};


/**
 * Table sHow/hide functionality
 * @param colName - name of column that needs to be hidden.
 */
Table.prototype.showHide = function (colName) {
    // Ordered dict to add the colName in the right index in the this.tableHeaders array
    var orderDict = {
        "Name": 0,
        "Company": 1,
        "Country": 2,
        "Email": 3
    };
    if(this.tableHeaders.indexOf(colName) > -1){
       this.tableHeaders.splice(this.tableHeaders.indexOf(colName), 1);
    } else {
        this.tableHeaders.splice(orderDict[colName], 0, colName);
    }
    this.create();
};
