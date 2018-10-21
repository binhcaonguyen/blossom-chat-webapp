let customConfig;
$.ajax({
    url: "https://service.xirsys.com/ice",
    data: {
        ident: "xirsys2010",
        secret: "46007ade-d451-11e8-b417-0242ac110003",
        domain: "blossombk.herokuapp.com",
        application: "default",
        room: "default",
        secure: 1
    },
    success: function(data, status) {
        customConfig = data.d;
        console.log(customConfig);
    },
    async: false
});

const config = { host: 'binhcao.herokuapp.com', port: 443, secure: true, key: 'peerjs', config: customConfig };


// const config = { host: 'binhcao.herokuapp.com', port: 443, secure: true, key: 'peerjs'};


const peer = new Peer(config);
$(document).ready(function () {
    $('#txtMyId').val(peer.id);
});

var call;
function callVideo() {
    const friendId = $('#txtFriendId').val().trim();
    openStream(stream => {
        playVideo(stream, 'localStream');
        call = peer.call(friendId, stream);
        call.on('stream', remoteStream => playVideo(remoteStream, 'friendStream'));
    });
}

peer.on('call', (call) => {
    openStream(stream => {
        playVideo(stream, 'localStream');
        call.answer(stream);
        call.on('stream', remoteStream => playVideo(remoteStream, 'friendStream'));
    });
});

function openStream(cb) {
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then(stream => {
            cb(stream);
        })
        .catch(err => console.log(err))
}

function playVideo(stream, idVideo) {
    const video = document.getElementById(idVideo);
    video.srcObject = stream;
    video.onloadedmetadata = function () {
        video.play();
    };
}

function closeStream() {
    call.close();
    var video = document.getElementById("localStream");
    video.src = "";
}