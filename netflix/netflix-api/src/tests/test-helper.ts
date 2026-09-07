import { userRepository } from "../api/services/user.repository";
import { Video, videoRepository, VideoType } from "../api/services/video.repository";

export async function createAuthenticatedUser() {
  const user = await userRepository.insert({
    username: "valaki",
    firstName: "Valaki",
    lastName: "Nagy",
    email: "valaki.nagy@gmail.com",
    password: "password",
  });

  return {
    userId: user.id!,
    username: user.username,
  };
}

export async function createTestVideo(
  title: string,
  type: VideoType,
  categories: string[],
  releaseYear: number,
  published: boolean,
): Promise<Video> {
  return await videoRepository.insert({
    title,
    description: `${title} description`,
    imgUrl: `${title.toLowerCase().replaceAll(" ", "-")}.jpg`,
    type,
    categories,
    releaseYear,
    published,
  });
}
