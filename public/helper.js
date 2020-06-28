function loaded() {
    const loader = document.querySelector('#loading');
    loader.parentElement.removeChild(loader);
    document.querySelector('main').classList.remove('hidden');
}

function status(string) {
    document.getElementById('msg').innerHTML = string;
}