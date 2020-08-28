var total = 0;
var current = 0;
function level0(type = 'used') {
    emptyTable();
    updateStats('', '', '', '', true);
    var textArea = document.getElementById('Invites-textarea');
    if (textArea.value == '') {
        return
    }
    var lines = textArea.value.split('\n');
    total = lines.length-1;
    for (var j = 0; j < lines.length; j++) {
        lines[j] = lines[j].replace(/\s/g, '');
        
        if (lines[j].length !== 64) {
            updateStats(1, '', '', '')
            continue;
        }
        level1(lines[j], type);
    }
}

function level1(invite, type) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
                if (JSON.parse(xmlhttp.responseText)['result'] !== null) {
                    level2(JSON.parse(xmlhttp.responseText)['result'][0]['value'], type, invite);
                } else {
                    updateStats(1, '', '', '')
                }

            } else {

                return null;
            }
        }
    };

    xmlhttp.open("GET", "https://api.idena.org/api/search?value=" + invite, true);
    xmlhttp.send();
}

function level2(address, type, invite) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
                if (JSON.parse(xmlhttp.responseText)['result'] !== null) {
                    if (JSON.parse(xmlhttp.responseText)['result']['state'] == 'Killed') {
                        updateStats('', '', 1, '')
                        if (type == 'passed') {
                            level3(address, invite);
                        } else {
                            addToTable(invite, address, 'True', 'False');
                        }

                    } else if (JSON.parse(xmlhttp.responseText)['result']['state'] == 'Invite') {
                        updateStats('', 1, '', '')
                    } else {

                    }
                }

            } else {
                return null;
            }
        }
    };

    xmlhttp.open("GET", "https://api.idena.org/api/identity/" + address, true);
    xmlhttp.send();
}

function level3(inviteAddress, invite) {

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
                if (JSON.parse(xmlhttp.responseText)['result'] !== null) {
                    level4(JSON.parse(xmlhttp.responseText)['result'][0]['hash'], JSON.parse(
                        xmlhttp.responseText)['result'][0]['to'],invite);
                }

            } else {
                return null;
            }
        }
    };

    xmlhttp.open("GET", "https://api.idena.org/api/address/" + inviteAddress + "/Txs?limit=1", true);
    xmlhttp.send();
}

function level4(Tx, InvitedAddress, invite) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
                if (JSON.parse(xmlhttp.responseText)['result'] !== null) {
                    level5(JSON.parse(xmlhttp.responseText)['result']['epoch'], InvitedAddress,invite);
                }

            } else {
                return null;
            }
        }
    };

    xmlhttp.open("GET", "https://api.idena.io/api/Transaction/" + Tx, true);
    xmlhttp.send();
}

function level5(epoch, address, invite) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
                if (JSON.parse(xmlhttp.responseText)['result'] !== null) {
                    if (JSON.parse(xmlhttp.responseText)['result']['state'] == 'Newbie') {
                        updateStats('', '', '', 1)
                        addToTable(invite, address, 'True', 'True');
                    }else{
                        addToTable(invite, address, 'True', 'False');
                    }
                }

            } else {
                return null;
            }
        }
    };

    xmlhttp.open("GET", "https://api.idena.org/api/epoch/" + epoch + "/identity/" + address, true);
    xmlhttp.send();
}

function updateStats(Invalid, NotUsed, Used, Passed, newStats = false) {
    if (newStats == true) {
        document.getElementById('Invalid-Count').innerHTML = '0';
        document.getElementById('NotUsed-Count').innerHTML = '0';
        document.getElementById('Used-Count').innerHTML = '0';
        document.getElementById('Passed-Count').innerHTML = '0';
    }
    if (Invalid !== '') {
        document.getElementById('Invalid-Count').innerHTML = Number(document.getElementById('Invalid-Count')
            .innerHTML) + 1;
    }
    if (NotUsed !== '') {
        document.getElementById('NotUsed-Count').innerHTML = Number(document.getElementById('NotUsed-Count')
            .innerHTML) + 1;
    }
    if (Used !== '') {
        document.getElementById('Used-Count').innerHTML = Number(document.getElementById('Used-Count').innerHTML) + 1;
    }
    if (Passed !== '') {
        document.getElementById('Passed-Count').innerHTML = Number(document.getElementById('Passed-Count')
            .innerHTML) + 1;
    }

}

function updateProgress(made, Total) {
    document.getElementById('Invites-Progress').style.width = (made/Total)*100 +'%';
}

function emptyTable() {
    current = 0;
    updateProgress(0,1);
    document.getElementById('Invites-Table').innerHTML = '';
}

function addToTable(Invite, Address, Used, Passed) {
    current = current + 1;
    updateProgress(current,total);
    document.getElementById('Invites-Table').innerHTML = document.getElementById('Invites-Table').innerHTML +
        '<tr>' +
        '<th scope="row">' + Invite.substring(0, 15) + '...</th>' +
        '<td>' + Address.substring(0, 15) + '...</td>' +
        '<td>' + Used + '</td>' +
        '<td>' + Passed + '</td>' +
        '</tr>';
}
function sendLevel1(address,invite){
    address = document.getElementById("Address-Sender").value;
    invite = document.getElementById("Invite-Sender").value;
var xhr = new XMLHttpRequest();
var url = "https://rpc.idena.dev";
xhr.open("POST", url, true);
xhr.setRequestHeader("Content-Type", "application/json");
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        var json = JSON.parse(xhr.responseText);
        sendLevel2(address,invite,json.result.pubkey);
    }
};
var data = JSON.stringify({
    "method": "dna_identity",
    "id":2,
    "params": [address]
});
xhr.send(data);
}

function sendLevel2(address,invite,pubkey){
    var xhr = new XMLHttpRequest();
var url = "https://rpc.idena.dev";
xhr.open("POST", url, true);
xhr.setRequestHeader("Content-Type", "application/json");
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        var json = JSON.parse(xhr.responseText);
        sendlevel3(window.getTx(invite,1,json.result.epoch,1,address,0,0,0,pubkey));
    }
};
var data = JSON.stringify({
    "method": "dna_epoch",
    "id":2,
    "params": []
});
xhr.send(data);

    
}
function sendlevel3(RawTx){
    var xhr = new XMLHttpRequest();
var url = "https://rpc.idena.dev";
xhr.open("POST", url, true);
xhr.setRequestHeader("Content-Type", "application/json");
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
        var json = JSON.parse(xhr.responseText);
        alert('Sent');
    }
};
var data = JSON.stringify({
    "method": "bcn_sendRawTx",
    "id":2,
    "params": ['0x'+RawTx]
});
xhr.send(data);

}