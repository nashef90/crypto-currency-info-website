"use strict";

function getStoreCurrencyMoreInfoAsync(currencyId) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (document.cookie !== "") {
                const cookieArr = document.cookie.split(";");
                for (const item of cookieArr) {
                    const cookieObj = item.split("=");
                    if (cookieObj[0] === `${currencyId}_currency_more_info`)
                        resolve(JSON.parse(cookieObj[1]));
                }
            }
            resolve(null);
        }, 1);
    });
}

function storeCurrencyMoreInfoAsync(currencyId, info) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const expireDate = new Date();
            expireDate.setMinutes(expireDate.getMinutes() + 2);
            document.cookie = `${currencyId}_currency_more_info=${JSON.stringify(info)}; expires= ${expireDate.toUTCString()}`;
            resolve();
        }, 1);
    });
}

function getReportCoins() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let json = localStorage.getItem("report_coins_list");
            if (json === null || json.trim() === "")
                resolve([]);
            else
                resolve(JSON.parse(json));
        }, 1);
    });
}

function setReportCoins(coinsList) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            localStorage.setItem("report_coins_list", JSON.stringify(coinsList));
            resolve();
        }, 1);
    });
}

function getLastRouteSelection(defaultValue) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let value = sessionStorage.getItem("last_route_selection");
            if (value === null || value.trim() === "")
                resolve(defaultValue);
            else
                resolve(value);
        }, 1);
    });
}

function setLastRouteSelection(value) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            sessionStorage.setItem("last_route_selection", value);
            resolve();
        }, 1);
    });
}