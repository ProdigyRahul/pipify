import { paginationQuery } from "@/@types/misc.types";
import History, { historyType } from "@/models/history.model";
import { RequestHandler } from "express";

/**
 * @desc    Update History Controller
 * @route   POST /api/v1/history
 * @access  Private
 *
 * Updates or creates a history record for the current user.
 * If a history record for today already exists, updates the progress.
 * Otherwise, adds a new history record.
 */
export const updateHistory: RequestHandler = async (req, res) => {
  const oldHistory = await History.findOne({ user: req.user.id });

  const { music, progress, date } = req.body;

  const history: historyType = { music, progress, date };

  if (!oldHistory) {
    await History.create({
      user: req.user.id,
      last: history,
      all: [history],
    });
    return res.json({ success: true });
  }

  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  );

  const histories = await History.aggregate([
    { $match: { user: req.user.id } },
    { $unwind: "$all" },
    {
      $match: {
        "all.date": {
          $gte: startOfDay,
          $lt: endOfDay,
        },
      },
    },
    {
      $project: {
        _id: 0,
        musicId: "$all.music",
      },
    },
  ]);

  // const sameDayHistory = histories.find((item) => {
  //   if (item.music.toString() === music) return item;
  // });
  const sameDayHistory = histories.find(
    ({ musicId }) => musicId.toString() === music
  );

  if (sameDayHistory) {
    await History.findOneAndUpdate(
      {
        user: req.user.id,
        "all.music": music,
      },
      {
        $set: {
          "all.$.progress": progress,
          "all.$.date": date,
        },
      }
    );
  } else {
    await History.findByIdAndUpdate(oldHistory._id, {
      $push: { all: { $each: [history], $position: 0 } },
      $set: { last: history },
    });
  }

  res.json({ success: true });
};

/**
 * @desc    Remove History Controller
 * @route   DELETE //v1//history
 * @access  Private
 *
 * Removes user's history. Can remove all history or specific entries.
 */
export const removeHistory: RequestHandler = async (req, res) => {
  const removeAll = req.query.all === "yes";

  if (removeAll) {
    // remove all the history
    await History.findOneAndDelete({ user: req.user.id });
    return res.json({ success: true });
  }

  const histories = req.query.histories as string;
  const ids = JSON.parse(histories) as string[];
  await History.findOneAndUpdate(
    { user: req.user.id },
    {
      $pull: { all: { _id: ids } },
    }
  );

  res.json({ success: true });
};

/**
 * @desc    Get Histories Controller
 * @route   GET /api/history
 * @access  Private
 *
 * Retrieves the history records for the current user with pagination.
 */
export const getHistories: RequestHandler = async (req, res) => {
  const { limit = "10", skip = "0" } = req.query as paginationQuery;
  const histories = await History.aggregate([
    { $match: { user: req.user.id } },
    {
      $project: {
        all: {
          $slice: ["$all", parseInt(limit) * parseInt(skip), parseInt(limit)],
        },
      },
    },
    { $unwind: "$all" },
    {
      $lookup: {
        from: "musics",
        localField: "all.music",
        foreignField: "_id",
        as: "musicInfo",
      },
    },
    { $unwind: "$musicInfo" },
    {
      $project: {
        _id: 0,
        id: "$all._id",
        musicId: "$musicInfo._id",
        date: "$all.date",
        title: "$musicInfo.title",
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$date" },
        },
        musics: { $push: "$$ROOT" },
      },
    },
    {
      $project: {
        _id: 0,
        id: "$id",
        date: "$_id",
        musics: "$$ROOT.musics",
      },
    },
    { $sort: { date: -1 } },
  ]);

  res.json({ histories });
};

/**
 * @desc    Get Recently Played Controller
 * @route   GET /api/history/recently-played
 * @access  Private
 *
 * Retrieves the 10 most recently played music tracks for the current user.
 */
export const getRecentlyPlayed: RequestHandler = async (req, res) => {
  const match = { $match: { user: req.user.id } };
  const sliceMatch = {
    $project: {
      myHistory: { $slice: ["$all", 10] },
    },
  };

  const dateSort = {
    $project: {
      histories: {
        $sortArray: {
          input: "$myHistory",
          sortBy: { date: -1 },
        },
      },
    },
  };

  const unwindWithIndex = {
    $unwind: { path: "$histories", includeArrayIndex: "index" },
  };

  const musicLookup = {
    $lookup: {
      from: "musics",
      localField: "histories.music",
      foreignField: "_id",
      as: "musicInfo",
    },
  };

  const unwindmusicInfo = {
    $unwind: "$musicInfo",
  };

  const userLookup = {
    $lookup: {
      from: "users",
      localField: "musicInfo.user",
      foreignField: "_id",
      as: "user",
    },
  };

  const unwindUser = { $unwind: "$user" };

  const projectResult = {
    $project: {
      _id: 0,
      id: "$musicInfo._id",
      title: "$musicInfo.title",
      about: "$musicInfo.about",
      file: "$musicInfo.file.url",
      thumbnail: "$musicInfo.thumbnail.url",
      category: "$musicInfo.category.url",
      user: { name: "$user.name", id: "$user._id" },
      date: "$histories.date",
      progress: "$histories.progress",
    },
  };

  const musics = await History.aggregate([
    match,
    sliceMatch,
    dateSort,
    unwindWithIndex,
    musicLookup,
    unwindmusicInfo,
    userLookup,
    unwindUser,
    projectResult,
  ]);

  res.json({ musics });
};
