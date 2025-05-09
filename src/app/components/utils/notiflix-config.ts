import Notiflix from 'notiflix';

export class NotiflixConfig {
  // Initialize all Notiflix configurations
  static initialize(): void {
    this.initConfirm();
    this.initNotify();
  }

  // Configuration for confirmation dialogs
  static initConfirm(): void {
    Notiflix.Confirm.init({
      titleColor: '#1775ee',
      okButtonBackground: '#1775ee',
      cancelButtonBackground: '#a9a9a9',
      width: '320px',
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif',
      cssAnimationStyle: 'zoom',
    });
  }

  // Configuration for notifications
  static initNotify(): void {
    Notiflix.Notify.init({
      position: 'right-top',
      width: '280px',
      distance: '10px',
      opacity: 1,
      borderRadius: '5px',
      fontFamily: 'Arial, sans-serif',
      cssAnimationStyle: 'fade',
      success: {
        background: '#32c682',
        textColor: '#fff',
      },
      failure: {
        background: '#ff5549',
        textColor: '#fff',
      },
      warning: {
        background: '#eebf31',
        textColor: '#fff',
      },
      info: {
        background: '#26c0d3',
        textColor: '#fff',
      },
    });
  }
}