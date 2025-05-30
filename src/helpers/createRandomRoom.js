export const randomRoom = (minRoomSize, maxRoomSize) => {
  return (
    minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1))
  );
};
