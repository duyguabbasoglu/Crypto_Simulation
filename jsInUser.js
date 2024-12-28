
$(document).ready(function () {

    let wallet = { cash: 1000.0, coins: {} };
    let currentDay = 2;
    let selectedCoin = 'btc';
    const targetDay = 365;

    let isPlaying = false;      
    let playInterval = null;    
    let initialDate = new Date("2021-01-02");

    const coinnames = {
        "ADA": "Cardano",
        "AVAX": "Avalanche",
        "BTC": "Bitcoin",
        "DOGE": "Dogecoin",
        "ETH": "Ethereum",
        "POL": "Polygon",
        "SNX": "Synthetix",
        "TRX": "Tron",
        "XRP": "Ripple"
    };

    $(".buy").addClass("active");
    $(".sell").removeClass("active");

    let firstSelectedIcon = $("#icons img.selected").attr("id") || "BTC"; 
    $(".sell-tron").text(`Buy ${coinnames[firstSelectedIcon.toUpperCase()]}`);

    function updateDate() {
        let updatedDate = new Date(initialDate);
        updatedDate.setDate(initialDate.getDate() + (currentDay - 2));

        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        const formattedDate = updatedDate.toLocaleDateString('en-GB', options);

        $("#currentDateDisplay").text(formattedDate);
    }

    function saveUserData() {
        const currentProfile = localStorage.getItem('currentProfile');
        if (!currentProfile) return;

        const userData = {
            wallet,
            currentDay,
            selectedCoin
        };

        localStorage.setItem(`userData_${currentProfile}`, JSON.stringify(userData));
    }

    function loadUserData() {
        const currentProfile = localStorage.getItem('currentProfile');
        if (!currentProfile) return;
    
        const userData = localStorage.getItem(`userData_${currentProfile}`);
        if (userData) {
            const parsedData = JSON.parse(userData);
            wallet = parsedData.wallet || { cash: 1000, coins: {} };
            currentDay = parsedData.currentDay || 2 - 1;
            selectedCoin = parsedData.selectedCoin || 'btc';
        } else {
            wallet = { cash: 1000, coins: {} };
            currentDay = 2;
            selectedCoin = 'btc';
        }
    
        updateWalletUI();
        $('h2').text(`Day ${currentDay}`);
        updateDate();
        // we tested and verified 'saveUserData' and 'loadUserData' 
        // functions handle errors
        drawCandles(selectedCoin);
    
        
        $("#icons img").removeClass("selected").css("animation", "none");
        $(`#${selectedCoin.toUpperCase()}`).addClass("selected").css("animation", "pulse 1s infinite");
    
      
        if ($(".buy").hasClass("active")) {
            $(".sell-tron").text(`Buy ${coinnames[selectedCoin.toUpperCase()].toUpperCase()}`);
        } else {
            $(".sell-tron").text(`Sell ${coinnames[selectedCoin.toUpperCase()].toUpperCase()}`);
        }
    
        updateCoinDisplay(selectedCoin);
        $(".image-panel span#coinInfo").text("");
    
       
        if (currentDay >= targetDay) {
            $("#wallet-display").addClass("heartbeat");
            $('.trading').hide();
            $('.wallet2').css({
                flex: '1',
                width: '100%',
            });
        } else {
            $('.trading').show();
            $('.wallet2').css({
                flex: '0 0 60%',
                width: '',
            });
            $("#wallet-display").removeClass("heartbeat");
        }
       
    }
    

    function updateCoinDisplay(coin) {
        const images = {
            "ADA": "./images/ada.png",
            "AVAX": "./images/avax.png",
            "BTC": "./images/btc.png",
            "DOGE": "./images/doge.png",
            "ETH": "./images/eth.png",
            "POL": "./images/pol.png",
            "SNX": "./images/snx.png",
            "TRX": "./images/trx.png",
            "XRP": "./images/xrp.png"
        };

        $(".image-panel img").attr("src", images[coin.toUpperCase()]);
        $(".image-panel span").text(coinnames[coin.toUpperCase()]);
    }

    function getCoinClosePrice(coinCode, dayIndex) {
        if (dayIndex < 0 || dayIndex >= market.length) {
            return 0;
        }
        let dayObj = market[dayIndex];
        if (!dayObj) return 0;
        let c = dayObj.coins.find(c => c.code === coinCode);
        return c ? c.close : 0;
    }

    let maxHigh = -Infinity;
    let minLow = Infinity;

    function drawCandles(selectedCoinCode) {
        const chartWidth = 786;
        const chartHeight = 400;
        const maxCandles = 120;
        const daySpacing = chartWidth / maxCandles;
        const maxDaysToShow = Math.floor(chartWidth / daySpacing);
    
        //extra #2
        const barWidth = daySpacing * 0.6;
        
        $('.candlechart').css({
            width: `${chartWidth}px`,
            height: `${chartHeight}px`,
            position: 'relative' 
        });
        $('.candlechart').empty();
    
        const startDay = Math.max(0, currentDay - maxDaysToShow );
        const visibleData = market.slice(startDay, currentDay - 1);
    
        const coinData = visibleData
            .map((dayObj) => {
                let c = dayObj.coins.find(cc => cc.code === selectedCoinCode);
                if (!c) return null;
                return {
                    date: dayObj.date,
                    open: c.open,
                    close: c.close,
                    high: c.high,
                    low: c.low
                };
            })
            .filter(Boolean);
    
        if (!coinData.length) return;
    
        const minPrice = Math.min(...coinData.map(d => d.low));
        const maxPrice = Math.max(...coinData.map(d => d.high));
        const priceRange = maxPrice - minPrice || 1;
    
        let scale = (p) => ((p - minPrice) / priceRange) * chartHeight;
            
        let maxHighText = $("#maxHighText");
    if (maxHighText.length === 0) {
        maxHighText = $("<div>")
            .attr("id", "maxHighText")
            .css({
                position: "absolute",
                top: "10px",
                right: "10px",
                color: "black",
                fontSize: "13px",
                zIndex: 10
            });
        $('.candlechart').append(maxHighText);
    }

    let minLowText = $("#minLowText");
    if (minLowText.length === 0) {
        minLowText = $("<div>")
            .attr("id", "minLowText")
            .css({
                position: "absolute",
                bottom: "10px",
                right: "10px",
                color: "black",
                fontSize: "13px",
                zIndex: 10
            });
        $('.candlechart').append(minLowText);
    }

    maxHigh = Math.max(...coinData.map(d => d.high));
    minLow = Math.min(...coinData.map(d => d.low));
    maxHighText.text(`$${maxHigh.toFixed(2)}`);
    minLowText.text(`$${minLow.toFixed(2)}`);

        coinData.forEach((d, i) => {
            if (d.high > maxHigh) {
                maxHigh = d.high;
                maxHighText.text(`$${maxHigh.toFixed(2)}`);
                maxHighText.css({
                    top: `${chartHeight - ((maxHigh - minLow) / (maxHigh - minLow) * chartHeight) - 20}px`,
                });
            }
    
            if (d.low < minLow) {
                minLow = d.low;
                minLowText.text(`$${minLow.toFixed(2)}`);
                minLowText.css({
                    top: `${chartHeight - ((minLow - minLow) / (maxHigh - minLow) * chartHeight) + 20}px`,
                });
            }

            let wickHeight = scale(d.high) - scale(d.low);
            let wickBottom = scale(d.low);
            let barHeight = Math.abs(scale(d.close) - scale(d.open));
            let barBottom = Math.min(scale(d.open), scale(d.close));
            let color = (d.close >= d.open) ? 'green' : 'red';
            
            let candleX = i * daySpacing + 10;
    
    
            let $stick = $('<div>')
            .addClass('stick')
            .css({
                left: `${candleX + (daySpacing - barWidth) / 2}px`,
                bottom: `${wickBottom}px`,
                height: `${wickHeight}px`,
                display: 'block',
            });
        
            let $bar = $('<div>')
            .addClass('bar')
            .css({
                left: `${candleX -2 + (daySpacing - barWidth) / 2}px`,
                bottom: `${barBottom}px`,
                height: `${barHeight}px`,
                backgroundColor: color,
                width: `${barWidth}px`,
                display: 'block',
            });
    
            $stick.add($bar).on('mouseenter', function () {
                $(".image-panel span#coinInfo").html(`
                    Date: ${d.date} 
                    Open: $${d.open.toFixed(5)} 
                    Close: $${d.close.toFixed(5)} 
                    High: $${d.high.toFixed(5)} 
                    Low: $${d.low.toFixed(5)}
                `).css('color', 'red');
            }).on('mouseleave', function () {
                $(".image-panel span#coinInfo").text("");
            });
    
            $('.candlechart').append($stick, $bar);
        });
    
        if (coinData.length > 0) {
            let lastClose = coinData[coinData.length - 1].close;
            let lastCloseY = scale(lastClose);
    
            let $lastCloseLine = $('<div>')
                .addClass('last-close-line')
                .css({
                    left: '10px',
                    bottom: `${lastCloseY}px`,
                    width: `${chartWidth}px`,
                    borderTop: '1px dashed black', 
                    position: 'absolute',
                });
    
            let $lastCloseLabel = $('<div>')
                .addClass('last-close-label')
                .css({
                    bottom: `${lastCloseY}px`,
                    right: '10px',
                    position: 'absolute',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)', 
                    padding: '2px 4px',
                    borderRadius: '3px',
                    fontSize: '12px',
                })
                .text(`$${lastClose.toFixed(2)}`);
    
            $('.candlechart').append($lastCloseLine, $lastCloseLabel);
        }
    }
    
    function updateWalletUI() {
        $(".dollar-row .highlight").text(`$${wallet.cash.toFixed(3)}`);
        $(".wallet tbody tr:not(.dollar-row)").remove();

        const coinIcons = {
            btc: "./images/btc.png",
            ada: "./images/ada.png",
            avax: "./images/avax.png",
            doge: "./images/doge.png",
            eth: "./images/eth.png",
            pol: "./images/pol.png",
            snx: "./images/snx.png",
            trx: "./images/trx.png",
            xrp: "./images/xrp.png"
        };

        let totalPortfolioValue = wallet.cash; 

        for (let coin in wallet.coins) {
            const amount = wallet.coins[coin];
            if (amount > 0) {
                const price = getCoinClosePrice(coin, currentDay - 2);
                const subtotal = price * amount;
                const icon = coinIcons[coin.toLowerCase()] || "";

                totalPortfolioValue += subtotal;

                $(".wallet tbody").append(`
                    <tr>
                        <td style="display: flex; align-items: center;">
                            <img src="${icon}" alt="${coin.toUpperCase()}" style="width: 16px; height: 16px; margin-right: 8px; vertical-align: middle; margin-top: 2px;">
                            ${coin.toUpperCase()}
                        </td>
                        <td>${amount.toFixed(5)}</td>
                        <td>${subtotal.toFixed(3)}</td>
                        <td>${price.toFixed(1)}</td>
                    </tr>
                `);
            }
        }

        $("#wallet-display").text(`$${totalPortfolioValue.toFixed(3)}`);
    }

    $("#logout").click(function () {
        saveUserData();
        localStorage.removeItem('currentProfile');
        window.location.href = "index.html";
    });


    const currentProfile = localStorage.getItem('currentProfile');
    if (currentProfile) {
        $('#profileIcon').after(`<span id="profileNameDisplay">${currentProfile}</span>`);
    }


    loadUserData();
    $('h2').text(`Day ${currentDay}`);
    updateDate();


    $("#icons img").on("click", function () {
        let id = $(this).attr("id");
        if (!id) return;

        selectedCoin = id.toLowerCase();
        saveUserData();
        updateCoinDisplay(selectedCoin);
        drawCandles(selectedCoin);

        $("#icons img").removeClass("selected").css("animation", "none");
        $(this).addClass("selected").css("animation", "pulse 1s infinite");
        $(".image-panel span#coinInfo").text("");


        if ($(".buy").hasClass("active")) {
            $(".sell-tron").text(`Buy ${coinnames[id.toUpperCase()].toUpperCase()}`);
        } else {
            $(".sell-tron").text(`Sell ${coinnames[id.toUpperCase()].toUpperCase()}`);
        }
    });

    $('#nextDayButton').click(function () {
        if(currentDay < 365) {
            currentDay++;
        }
        
        if (currentDay >= 366) {
            return;
        }
        $('h2').text(`Day ${currentDay}`);
        updateDate();
        drawCandles($("#icons img.selected").attr("id").toLowerCase());
        updateWalletUI();

        if (currentDay === 365) {
            $("#wallet-display").addClass("heartbeat");
            $('.trading').hide();
            $('.wallet2').css({
                flex: '1',
                width: '100%',
            });
        } else {
            $('.trading').show();
            $('.wallet2').css({
                flex: '0 0 60%',
                width: '',
            });
            $("#wallet-display").removeClass("heartbeat");
        }
    });


    $(".buy").on("click", function () {
        $(this).addClass("active");
        $(".sell").removeClass("active");

        let selectedIcon = $("#icons img.selected").attr("id") || "BTC";
        let coinName = coinnames[selectedIcon.toUpperCase()].toUpperCase();
        $(".sell-tron").text(`Buy ${coinName.toUpperCase()}`);
    });

    $(".sell").on("click", function () {
        $(this).addClass("active");
        $(".buy").removeClass("active");

        let selectedIcon = $("#icons img.selected").attr("id") || "BTC";
        let coinName = coinnames[selectedIcon.toUpperCase()].toUpperCase();
        $(".sell-tron").text(`Sell ${coinName.toUpperCase()}`);
    });


    $(".sell-tron").on("click", function () {
        let selectedIcon = $("#icons img.selected").attr("id");
        if (!selectedIcon) {
            alert("Please select a coin first.");
            return;
        }
        let selectedCoinCode = selectedIcon.toLowerCase();

        let isSelling = $(".sell").hasClass("active");
        let isBuying = $(".buy").hasClass("active");

        let amountStr = $(".amount-input input").val().trim();
        let amount = parseFloat(amountStr);
        if (!amount || amount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        let dayIndex = currentDay - 2;
        let price = getCoinClosePrice(selectedCoinCode, dayIndex);
        if (price <= 0) {
            alert("No price data for this coin/day. Try another day or coin.");
            return;
        }

        if (isBuying) {
            let cost = price * amount;
            if (wallet.cash >= cost) {
                wallet.cash -= cost;
                if (!wallet.coins[selectedCoinCode]) {
                    wallet.coins[selectedCoinCode] = 0;
                }
                wallet.coins[selectedCoinCode] += amount;
            } else {
                alert("Not enough cash.");
                return;
            }
            // extra: we added proper alerts for trading calculations, it gives error from window panel
        } else if (isSelling) {
            if (!wallet.coins[selectedCoinCode] || wallet.coins[selectedCoinCode] < amount) {
                alert("You don't have enough coins.");
                return;
            }
            let revenue = price * amount;
            wallet.coins[selectedCoinCode] -= amount;
            wallet.cash += revenue;
        }

        $(".amount-input input").val("");
        $(".amount-input span").text("= $");

        updateWalletUI();
    });


    $("#playPauseButton").click(function () {
        if (currentDay >= targetDay) {
           
            if ($(this).text().includes("Play")) {
                $(this).text("Pause")
                $(this).html('<i class="fa-solid fa-pause"></i> <span>Pause</span>');
            } else {
                $(this).text("Play");
                $(this).html('<i class="fa-solid fa-play"></i> <span>Play</span>')
            }
            $(this).css({
                "width": "90px",
                "gap": "8px",
                "border-radius": "5px",
                "background-color": "white",
                "font-size": "14px",
                "display": "flex",
                "align-items": "center",

            });
            return;
        }
        if (isPlaying) {
            stopAutoPlay();
        } else {
            startAutoPlay();
        }

        $(this).css({
            "width": "90px",
            "gap": "5px",
            "border-radius": "5px",
            "background-color": "white",
            "text-align": "center",
            "font-size": "14px",
        });
    });
    
    $("#playPauseButton").hover(
        function() { 
            $(this).css({
                "background-color": "#dfdede", 
            });
        }, 
        function() { 
            if (currentDay >= targetDay) {
                $(this).css({
                    "background-color": "white",
                    "color": "initial" 
                });
            } else {
                $(this).css({
                    "background-color": "white",
                    "color": "initial" 
                });
            }
        }
    );

    function startAutoPlay() {
        if (isPlaying) return;
        isPlaying = true;
        $("#playPauseButton").text("Pause");
        $("#playPauseButton").html('<i class="fa-solid fa-pause"></i> <span>Pause</span>');
        playInterval = setInterval(nextDay, 100);
    }

    function stopAutoPlay() {
        if (!isPlaying) return;
        isPlaying = false;
        $("#playPauseButton").text("Play");
        $("#playPauseButton").html('<i class="fa-solid fa-play"></i> <span>Play</span>');
        if (playInterval) {
            clearInterval(playInterval);
            playInterval = null;
        }

        if (currentDay >= targetDay) {
            $("#wallet-display").addClass("heartbeat");
            $('.trading').hide();
            $('.wallet2').css({
                flex: '1',
                width: '100%',
            });
        } else {
            $("#wallet-display").removeClass("heartbeat");
        }
    }


    function nextDay() {
        if (currentDay >= targetDay) {
            stopAutoPlay();
            $("#wallet-display").addClass("heartbeat");
            $('.trading').hide();
            $('.wallet2').css({
                flex: '1',
                width: '100%',
            });
            return;
        }

        currentDay++;
        $('h2').text(`Day ${currentDay}`);
        updateDate();
        drawCandles(selectedCoin);
        updateWalletUI();
    }


    $(".amount-input input").on("input", function () {
        let amount = parseFloat($(this).val().trim());
        let selectedIcon = $("#icons img.selected").attr("id")?.toLowerCase();
        let dayIndex = currentDay - 2;

        if (isNaN(amount) || amount <= 0 || !selectedIcon) {
            $(".amount-input span").text("= $ ");
            return;
        }

        let price = getCoinClosePrice(selectedIcon, dayIndex);
        if (price > 0) {
            let dollarValue = (amount * price).toFixed(5);
            $(".amount-input span").text(`= $${dollarValue}`);
        } else {
            $(".amount-input span").text("= $ ");
        }
    });
 
    $(".trade-buttons .buy").on("click", function () {
        $(this).addClass("active");
        $(".trade-buttons .sell").removeClass("active");
        $(".sell-tron").removeClass("active").css("background-color", "green");
    });

    $(".trade-buttons .sell").on("click", function () {
        $(this).addClass("active");
        $(".trade-buttons .buy").removeClass("active");
        $(".sell-tron").addClass("active").css("background-color", "red");
    });

});

