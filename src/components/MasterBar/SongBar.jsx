import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  IoMdAddCircleOutline,
  IoIosSkipBackward,
  IoIosSkipForward,
} from "react-icons/io";
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

const SongBar = () => {
  const { masterSong, isPlaying } = useSelector((state) => state.mainSong);
  const dispatch = useDispatch();
  const handleMaster = () => {
    if (isPlaying) {
      dispatch(pauseMaster());
    } else {
      dispatch(playMaster());
    }
  };
  useEffect(() => {
    if (masterSong) {
      if (isPlaying) masterSong?.mp3?.play();
      else masterSong?.mp3?.pause();
    }
  }, [masterSong, isPlaying]);

  return (
    <div className="w-full fixed bottom-0 left-0 h-20 justify-between bg-black flex items-center px-4">
      <div className="flex items-center gap-4 w-1/4">
        <img
          src="https://i.scdn.co/image/ab67706f00000002cc1c6b2c3df5dcbd56a50faa"
          alt="Song Cover"
          className="h-14 w-14 rounded-md "
        />
        <div className="flex flex-col text-sm font-normal ">
          <p className=" ">{masterSong?.title || "No Title"}</p>
          <p className="text-xs text-gray-400 ">
            {masterSong?.artist || "Unknown Artist"}
          </p>
        </div>
        <IoMdAddCircleOutline className="text-xl text-gray-400" />
      </div>
      <div className="w-2/4 flex flex-col justify-center items-center mb-2 mt-2">
        <div className="flex justify-center gap-5 items-center">
          <LuShuffle className="text-lg " />
          <IoIosSkipBackward className="text-2xl" />
          {isPlaying ? (
            <button onClick={handleMaster} className="">
              <IoPauseCircleSharp className="text-white text-[40px] justify-center" />
            </button>
          ) : (
            <button onClick={handleMaster} className="">
              <IoPlayCircleSharp
                CircleSharp
                className="text-white text-[40px] justify-center"
              />
            </button>
          )}
          <IoIosSkipForward className="text-2xl" />
          <LuRepeat2 className="text-lg " />
        </div>
        <div className="flex items-center gap-2 mt-2 w-5/6 max-w-lg ">
          <span className="text-xs text-gray-400  ">00:00</span>
          <input
            type="range"
            name=""
            id=""
            min={0}
            max={100}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-400">00:00</span>
        </div>
      </div>

      <div className="w-1/4 flex justify-end items-center gap-4 pr-4 ">
        <AiOutlinePlaySquare className="text-xl" />
        <HiOutlineQueueList className="text-xl" />
        <LuVolume2 className="text-xl" />
        <input
          type="range"
          name=""
          id=""
          min={0}
          max={100}
          className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer "
        />
        <TbArrowsDiagonal className="text-xl" />
      </div>
    </div>
  );
};

export default SongBar;
