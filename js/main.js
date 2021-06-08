/// <reference path="jquery-3.6.0.js" />
/// <reference path="storage-helper.js" />
"use strict";

//====================== Global ======================
const loadingImgHtml = "<img class='loading-img' src='assets/images/loading.gif' />";
const pages = [{
        id: "home",
        title: "Home",
        linkText: "Home"
    },
    {
        id: "real-time",
        title: "Real Time",
        linkText: "Real Time"
    },
    {
        id: "about",
        title: "About",
        linkText: "About"
    }
];

$(() => {
    loadNavBarLinks();
    setPageLoadFunc();
    $('#parallax-image').parally({ offset: 400, speed: 1 });
    getLastRouteSelection("home").then(val => route(val));
});

function setPageLoadFunc() {
    $('#home-page').on('reload', function() {
        loadCoins();
    });

    $('#real-time-page').on('reload', function() {
        realTimePageReload();
    });
}

function loadNavBarLinks() {
    let navBarLinks = $("#nav-bar-links");
    let html = "";
    for (const item of pages) {
        html += `<li class="nav-item" id="${item.id}-navbar-link" onclick="route('${item.id}')">
                    <a class="nav-link" href="#" >${item.linkText}</a>
                 </li>`;
    }
    navBarLinks.html(html);
}

function route(pageId) {
    for (const item of pages) {
        if (item.id.toLowerCase() == pageId.toLowerCase()) {
            $(`#${item.id}-navbar-link`).addClass("active").addClass("disabled");
            $(`#${item.id}-page`).show().trigger('reload');
            $("#page-title").text(item.title);
            setLastRouteSelection(item.id);
        } else {
            $(`#${item.id}-navbar-link`).removeClass("active").removeClass("disabled");
            $(`#${item.id}-page`).hide();
        }
    }
}

//====================== Home page ======================
function searchCoin(event) {
    if (event.key === "Enter") {
        loadCoins(event.target.value);
    }
}

function loadCoins(searchText = "") {
    $("#currency-container").html(loadingImgHtml);
    getOnlineCurrencysAsync(searchText)
        .then(data => {
            let html = "";
            data.forEach(item => {
                html += `
                <section class="currency-item" id="${item.id}-currency">
                <div class="custom-control custom-switch">
                    <input type="checkbox" class="custom-control-input add-to-report-checkbox" id="cb-${item.id}" data-currency-id="${item.id}" data-currency-symbol="${item.symbol}" onchange="addToReport(this)">
                    <label class="custom-control-label" for="cb-${item.id}"></label>
                </div>
                <h5 class="currency-code">${item.symbol.toUpperCase()}</h5>
                <p class="currency-name">${item.id}</p>
                <a class="btn btn-primary" onclick="moreInfoAsync('${item.id}')"> <i class="fa fa-chevron-right"></i> more info</a>
                <div class="more-info-container"></div>
            </section>
        `;
            });
            $("#currency-container").html(html);
            refreshReportCheckBox();
        })
        .catch(errMsg => {
            $("#currency-container")
                .html(`
                    <div class="api-error-message">
                        <div>API Error !!</div>
                        <p>${errMsg}</p>
                    </div>
                `);
        });
}

function refreshReportCheckBox() {
    $(`.add-to-report-checkbox`).each(function() {
        this.checked = false;
    });
    getReportCoins()
        .then(coinsList => {
            coinsList.forEach(item => {
                $(`#${item.id}-currency .add-to-report-checkbox`).each(function() {
                    this.checked = true;
                });
            });
        })
        .catch(err => alert(err));
}

function addToReport(element) {
    const id = element.dataset.currencyId;
    const symbol = element.dataset.currencySymbol;
    getReportCoins()
        .then(coinsList => {
            if (element.checked) {
                if (coinsList.length >= 5) {
                    let html = "";
                    coinsList.forEach(item => {
                        html += `
                                    <tr>
                                        <td>
                                            <div class="custom-control custom-switch">
                                                <input type="checkbox" class="custom-control-input add-to-report-checkbox" id="cb-${item.id}-modal" data-currency-id="${item.id}" checked>
                                                <label class="custom-control-label" for="cb-${item.id}-modal"></label>
                                            </div>
                                        </td>
                                        <td>
                                            <Label class="currency-code">${item.symbol.toUpperCase()}</Label>
                                            <Label class="currency-name">${item.id}</Label>
                                        </td>                                        
                                    </tr>
                                `;
                    });
                    $("#selectReportCurrencyModal table").html(html);
                    $("#selectReportCurrencyModal")[0].dataset.newCurrencyId = id;
                    $("#selectReportCurrencyModal")[0].dataset.newCurrencySymbol = symbol;
                    $("#selectReportCurrencyModal").modal("show");
                    element.checked = false;
                } else {
                    coinsList.push({
                        "id": id,
                        "symbol": symbol
                    });
                }
            } else {
                coinsList = coinsList.filter(x => x.id !== id)
            }
            setReportCoins(coinsList);
        })
        .catch(err => alert(err));
}

async function moreInfoAsync(currencyId) {
    if ($(`#${currencyId}-currency>.more-info-container`).is(":visible")) {
        $(`#${currencyId}-currency>.more-info-container`).hide();
        $(`#${currencyId}-currency .fa-chevron-down`).removeClass("fa-chevron-down").addClass("fa-chevron-right");
        return;
    } else {
        $(`#${currencyId}-currency .fa-chevron-right`).removeClass("fa-chevron-right").addClass("fa-chevron-down");
    }
    $(`#${currencyId}-currency>.more-info-container`)
        .html(loadingImgHtml)
        .show();
    try {
        const data = await getCurrencyMoreInfoAsync(currencyId);
        console.log("data.img: ", data.img);
        $(`#${currencyId}-currency>.more-info-container`)
            .html(`
                        <img src="${data.img}" />
                        <table>
                            <tr>
                                <td>USD</td>
                                <td>${data.usd} &#36;</td>
                            </tr>
                            <tr>
                                <td>EUR</td>
                                <td>${data.eur} &euro;</td>
                            </tr>
                            <tr>
                                <td>ILS</td>
                                <td>${data.ils} &#8362;</td>
                            </tr>
                        </table>
                    `);
    } catch (err) {
        $(`#${currencyId}-currency>.more-info-container`)
            .html(`
            <div class="api-error-message">
                <div>API Error !!</div>
                <p>${err}</p>
            </div>
        `);
    }
}

function getCurrencyMoreInfoAsync(currencyId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            getStoreCurrencyMoreInfoAsync(currencyId).then(result => {
                if (result === null) {
                    getOnlineCurrencyMoreInfoAsync(currencyId).then(onlineData => {
                        storeCurrencyMoreInfoAsync(currencyId, onlineData);
                        resolve(onlineData);
                    }).catch(err => reject(err));
                } else {
                    resolve(result);
                }
            }).catch(err => reject(err));
        }, 1);
    });
}

async function getOnlineCurrencyMoreInfoAsync(currencyId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            $.ajax({
                url: `https://api.coingecko2.com/api/v3/coins/${currencyId}`,
                success: data => {
                    let storeItem = {
                        id: data.id,
                        symbol: data.symbol,
                        name: data.name,
                        img: data.image.small,
                        ils: data.market_data.current_price.ils,
                        usd: data.market_data.current_price.usd,
                        eur: data.market_data.current_price.eur,
                    };
                    console.log("storeItem.img: ", storeItem.img);
                    resolve(storeItem);
                },
                error: function(xhr, status, error) {
                    if (xhr.responseJSON !== undefined) {
                        reject(`(${xhr.status}) ${xhr.responseJSON.error}`);
                    } else {
                        reject(`(${xhr.status}) ${xhr.statusText}`);
                    }
                }
            });
        }, 1);
    });
}

async function getOnlineCurrencysAsync(searchText = "") {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            $.ajax({
                url: `https://api.coingecko.com/api/v3/coins/list`,
                success: data => {
                    if (searchText !== null && searchText !== undefined && searchText.trim() !== "")
                        data = data.filter(x =>
                            x.symbol.toLowerCase() === searchText.toLowerCase());
                    if (data.length > 100)
                        data = data.slice(0, 99);
                    resolve(data);
                },
                error: function(xhr, status, error) {
                    if (xhr.responseJSON !== undefined) {
                        reject(`(${xhr.status}) ${xhr.responseJSON.error}`);
                    } else {
                        reject(`(${xhr.status}) ${xhr.statusText}`);
                    }
                }
            });
        }, 1);
    });
}

function modalSave() {
    let newCurrencyId = $("#selectReportCurrencyModal")[0].dataset.newCurrencyId;
    let newCurrencySymbol = $("#selectReportCurrencyModal")[0].dataset.newCurrencySymbol;
    let removeItemsIds = [];
    $("#selectReportCurrencyModal input").each(function() {
        if (!this.checked) {
            removeItemsIds.push(this.dataset.currencyId);
        }
    });
    getReportCoins()
        .then(coinsList => {
            coinsList = coinsList.filter(x => !removeItemsIds.includes(x.id));
            if (coinsList.length < 5) {
                coinsList.push({
                    "id": newCurrencyId,
                    "symbol": newCurrencySymbol
                });
                setReportCoins(coinsList);
                refreshReportCheckBox();
            }
            $("#selectReportCurrencyModal").modal("hide");
        })
        .catch(err => alert(err));
}

//====================== Real time page ======================

// chart
var options = {
    animationEnabled: true,
    theme: "light2",
    title: {
        text: "Coins to USD"
    },
    axisX: {
        title: "Time",
        valueFormatString: "HH:mm:ss"
    },
    axisY: {
        title: "Coin Value",
        suffix: "$",
    },
    toolTip: {
        shared: true
    },
    legend: {
        cursor: "pointer",
        verticalAlign: "bottom",
        horizontalAlign: "left",
        dockInsidePlotArea: true,
        itemclick: toogleDataSeries
    },
    data: [{
        type: "line",
        showInLegend: true,
        name: "test",
        markerType: "square",
        xValueFormatString: "DD/MM/YYYY HH:mm:ss",
        color: "#F08080",
        yValueFormatString: "0.00$",
        dataPoints: [
            { x: new Date(2017, 10, 1, 3, 4), y: 63.345 },
            { x: new Date(2017, 10, 2, 5, 6), y: 69 },
        ]
    }]
};

function toogleDataSeries(e) {
    if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
        e.dataSeries.visible = false;
    } else {
        e.dataSeries.visible = true;
    }
    e.chart.render();
}

function realTimePageReload() {
    let color = ["green", "#4472C4", "#FFC000", "#A5A5A5", "#ED7D31"]
    let cryptoList = "";
    const realTimePage = $("#real-time-page");
    realTimePage.html(loadingImgHtml);
    options.data = [];
    getReportCoins().then(data => {
        if (data.length > 0) {
            for (let i = 0; i < data.length; i++) {

                if (cryptoList !== "")
                    cryptoList += ",";
                cryptoList += data[i].symbol.toUpperCase();

                options.data.push({
                    type: "line",
                    showInLegend: true,
                    name: data[i].symbol.toUpperCase(),
                    markerType: "square",
                    xValueFormatString: "DD/MM/YYYY HH:mm:ss",
                    color: color[i],
                    // yValueFormatString: "#0.## $",
                    suffix: "$",
                    dataPoints: []
                });
            }
            realTimePage.html(`<div id="chartContainer" style="height: 370px; width: 100%;"></div>`);
            options.title.text = `${cryptoList} to USD`;
            chartSampling();
        } else {
            realTimePage.html(`<div class="message">Please select coins for the report from the home page</div>`);
        }
    });

    function chartSampling() {
        if (!$("#real-time-page").is(":visible"))
            return;

        getCryptoCompareDataAsync(cryptoList)
            .then(data => {
                let now = new Date();
                options.data.forEach(item => {
                    item.dataPoints.push({
                        x: now,
                        y: data[item.name].USD
                    });
                })
                $("#chartContainer").CanvasJSChart(options);
                setTimeout(chartSampling, 2 * 1000);
            });
    }
}

async function getCryptoCompareDataAsync(cryptoList) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            $.ajax({
                url: `https://min-api.cryptocompare.com/data/pricemulti?tsyms=USD&fsyms=${cryptoList}`,
                success: data => {
                    resolve(data);
                },
                error: function(xhr, status, error) {
                    if (xhr.responseJSON !== undefined) {
                        reject(`(${xhr.status}) ${xhr.responseJSON.error}`);
                    } else {
                        reject(`(${xhr.status}) ${xhr.statusText}`);
                    }
                }
            });
        }, 1);
    });
}