import { useAudio } from "../../states/AudioProvider";
import { IoIosSkipBackward, IoIosSkipForward } from "react-icons/io";
import { IoPauseCircleSharp, IoPlayCircleSharp } from "react-icons/io5";
import {
  LuShuffle,
  LuRepeat2,
  LuVolume2,
  LuVolume1,
  LuVolume,
} from "react-icons/lu";
import { AiOutlinePlaySquare } from "react-icons/ai";
import { HiOutlineQueueList } from "react-icons/hi2";
import { TbArrowsDiagonal } from "react-icons/tb";
import "./SongBar.css";

const Songbar = () => {
  const {
    currentSong,
    isPlaying,
    playPauseSong,
    togglePlayPause,
    progress,
    changeProgress, // <--- We'll call this on slider drag
    currTime,        // current playback time (e.g. "01:23")
    duration,        // total track length (e.g. "03:45")
    changeVolume,
    volume,
    nextSong,
    prevSong,
  } = useAudio();

  // If no song is selected, don't render the bar
  if (!currentSong) return null;

  return (
    <div className="w-full h-[100px] fixed bottom-0 left-0 h-[90px] bg-black flex justify-between items-center px-4">
      {/* Left: Song Info */}
      <div className="flex items-center gap-4 w-[30%] min-w-[250px]">
        <img
          src={
            currentSong.albumCover ||
            "https://i.scdn.co/image/ab67706f00000002cc1c6b2c3df5dcbd56a50faa"
          }
          alt="Song Cover"
          className="h-14 w-14 rounded-md"
        />
        <div className="flex flex-col text-sm font-normal">
          <p className="truncate w-[150px]">
            {currentSong.name || "Unknown Title"}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {(currentSong.artists || []).map((artist) => artist.name).join(", ")}
          </p>
        </div>
      </div>

      {/* Middle: Playback Controls */}
      <div className="flex flex-col items-center w-[40%] min-w-[300px]">
        <div className="flex justify-center gap-5 items-center mt-1">
          <LuShuffle className="text-lg cursor-pointer" />
          <IoIosSkipBackward
            onClick={prevSong}
            className="text-2xl cursor-pointer"
          />

          {/* If isPlaying, show pause button; otherwise show play button */}
          {isPlaying ? (
            <IoPauseCircleSharp
              className="text-white text-[40px] cursor-pointer"
              onClick={togglePlayPause} // Pause/Resume the *current* track
            />
          ) : (
            <IoPlayCircleSharp
              className="text-white text-[40px] cursor-pointer"
              onClick={() => playPauseSong(currentSong)} // Start track from 0
            />
          )}

          <IoIosSkipForward onClick={nextSong} className="text-2xl cursor-pointer" />
          <LuRepeat2 className="text-lg cursor-pointer" />
        </div>

        {/* Progress Bar + Times */}
        <div className="flex items-center gap-3 w-full px-4 mt-2 mb-1">
          <span className="text-xs text-gray-400 w-8 text-right">{currTime}</span>
          
          {/* Add an onChange so the slider is controllable */}
          <input
            type="range"
            min={0}
            max={100}
            value={isNaN(progress) ? 0 : progress}
            onChange={(e) => changeProgress(Number(e.target.value))}
            className="w-full cursor-pointer"
          />

          <span className="text-xs text-gray-400 w-8 text-right">{duration}</span>
        </div>
      </div>

      {/* Right: Volume & Queue */}
      <div className="flex items-center justify-end w-[30%] min-w-[250px] gap-4">
        <AiOutlinePlaySquare className="text-xl" />
        <HiOutlineQueueList className="text-xl" />

        {/* Show different volume icons depending on volume level */}
        {volume > 50 ? (
          <LuVolume2 className="text-xl" />
        ) : volume > 0 ? (
          <LuVolume1 className="text-xl" />
        ) : (
          <LuVolume className="text-xl" />
        )}
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={changeVolume}
          className="w-24 cursor-pointer"
        />
        <TbArrowsDiagonal className="text-xl" />
      </div>
    </div>
  );
};

export default Songbar;
