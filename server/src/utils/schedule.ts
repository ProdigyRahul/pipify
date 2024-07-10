import AutoPlaylist from "@/models/autogenerated.model";
import Music from "@/models/music.model";
import cron from "node-cron";

const generatePlaylist = async () => {
  const result = await Music.aggregate([
    { $sort: { likes: -1 } },
    {
      $sample: { size: 10 },
    },
    {
      $group: {
        _id: "$categories",
        musics: {
          $push: "$$ROOT._id",
        },
      },
    },
  ]);
  result.map(async (item) => {
    await AutoPlaylist.updateOne(
      { title: item._id },
      {
        $set: { items: item.musics },
      },
      { upsert: true }
    );
  });
};

cron.schedule("0 0 * * *", async () => {
  await generatePlaylist();
});
