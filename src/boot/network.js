const network = {
  offlineMode: false,
  offlineModeAvailable: false,
};

function setGlobalOfflineMode(bool) {
  network.offlineMode = bool;
}

function setGlobalOfflineModeAvailable(bool) {
  network.offlineModeAvailable = bool;
}

export {
  network,
  setGlobalOfflineMode,
  setGlobalOfflineModeAvailable,
};
