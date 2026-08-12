import { sessionRepository } from "../api/services/session.repository";
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

  const sessionId = await sessionRepository.insert(user.id!);

  return {
    userId: user.id!,
    sessionId,
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
