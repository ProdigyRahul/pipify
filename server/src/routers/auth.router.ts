import { NewUser } from "@/@types/user.types";
import { User } from "@/models/user.model";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/signup", async (req: NewUser, res) => {
  // Implement signup logic here
  const { email, password, name } = req.body;
  const user = new User({ email, password, name });
  //   user.save()
  await User.create({ email, password, name });
  res.status(201).json({ message: "User created successfully" });
});

export default authRouter;
