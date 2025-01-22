
const themeSelector = document.querySelector('#theme-selector');

const logo = document.getElementById('logo');

function changeTheme() {
  const currentTheme = themeSelector.value;

  if (currentTheme === 'dark') {
    document.body.classList.add('dark');
    logo.src = 'images/byu-logo_white.png';
  } else {
    document.body.classList.remove('dark');
    logo.src = 'images/byu-logo_blue.webp';
  }
}
themeSelector.addEventListener('change', changeTheme);
