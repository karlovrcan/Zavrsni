// data/songs.js
export const songs = [
    {
      id: Math.random() * Date.now(),
      title: "Mr. Weatherman",
      artist: "Hank Williams Jr.",
      mp3: new Audio("/assets/mp3/All My Ex's Live In Texas.mp3"),
    },
    {
      id: Math.random() * Date.now(),
      title: "SEXY BATMAN",
      artist: "Idk",
      mp3: new Audio("/assets/mp3/SEXY BATMAN 2 MUSIC CAR.mp3"),
    },
    {
      id: Math.random() * Date.now(),
      title: "All my exes live in Texas",
      artist: "Another One",
      mp3: new Audio("/assets/mp3/Hank Williams Jr. - Mr. Weatherman - 1982.mp3"),
    },
  ];