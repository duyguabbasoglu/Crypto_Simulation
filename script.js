function showPopup() {
    $('#overlay').show();
    $('#popup').show();
}

function closePopup() {
    $('#overlay').hide();
    $('#popup').hide();
}

let profiles = [];

function loadProfiles() {
    const profilesDiv = $('#profiles');
    let storedProfiles = localStorage.getItem('profiles');

    if (!storedProfiles) { 
        let defaultProfiles = [
            "Duygu Abbasoğlu",
            "Ece Naz Çalkınsın",
            "Emir Kılıç",
            "Başak Uran",
            "İbrahim Ege Yakut"
        ];
        localStorage.setItem('profiles', JSON.stringify(defaultProfiles));
        storedProfiles = localStorage.getItem('profiles');
    }

    profiles = JSON.parse(storedProfiles);

    profilesDiv.empty();
    if (profiles.length === 0) { 
        profilesDiv.append('<p class="empty">Empty</p>');
    } else {
        profiles.forEach(function (profile, index) {
            profilesDiv.append(`
                <div class="profile" data-index="${index}" data-name="${profile}">
                    <img class="profile-icon" src="./images/profile-icon.png" alt="Profile Icon">
                    <span class="profile-name">${profile}</span>
                    <button class="remove-profile">x</button>
                </div>
            `);
        });
    }
}

function addProfile(profileName) {
    profileName = profileName.trim();
    if (profileName !== '') {
        profiles.push(profileName); 
        localStorage.setItem('profiles', JSON.stringify(profiles));
        localStorage.setItem('currentProfile', profileName);
        loadProfiles();
        closePopup();
        $('#profileName').val(''); 
    } else {
        alert('Please enter a profile name.');
    }
}

$(document).on('click', '.remove-profile', function (event) {
    event.stopPropagation(); 
    var profileIndex = $(this).parent().data('index');
    profiles.splice(profileIndex, 1); 
    localStorage.setItem('profiles', JSON.stringify(profiles));
    loadProfiles();
});

$(document).on('click', '.profile', function () {
    var profileName = $(this).data('name'); 
    localStorage.setItem('currentProfile', profileName);
    window.location.href = `indexInUser.html?profile=${encodeURIComponent(profileName)}`;
});

$(document).ready(function () {
    loadProfiles();
    
    $('#addProfile').click(function () {
        var profileName = $('#profileName').val();
        addProfile(profileName);
    });

    $('#overlay').click(function () {
        closePopup();
    });
});
