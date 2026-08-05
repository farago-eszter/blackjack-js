import { sessionRepository } from "../api/services/session.repository";
import { userRepository } from "../api/services/user.repository";
import { Video, videoRepository, VideoType } from "../api/services/video.repository";

export function createAuthenticatedUser() {
  const user = userRepository.insert({
    username: "valaki",
    firstName: "Valaki",
    lastName: "Nagy",
    email: "valaki.nagy@gmail.com",
    password: "password",
  });

  const sessionId = sessionRepository.insert(user.id!);

  return {
    userId: user.id!,
    sessionId,
  };
}

export function createTestVideo(title: string, type: VideoType, categories: string[], releaseYear: number): Video {
  return videoRepository.insert({
    title,
    description: `${title} description`,
    imgUrl: `${title.toLowerCase().replaceAll(" ", "-")}.jpg`,
    type,
    categories,
    releaseYear,
  });
}
