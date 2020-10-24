var macAddress = window.location.href;

function removeCharacter(address){
    address.replace('https://hubenov.org/', '');
    return address;
}

function fetchDataFromDB(){
    macAddress = removeCharacter(macAddress);
    fetch("http://37cddd59b076.ngrok.io/users/Ivan")
    .then(response => {
       return response.json()
    })
    .then(data=> console.log(data));
}

fetchDataFromDB();

(function(){ // loading graph


})();