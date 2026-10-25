maze = [
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 1],
    [0, 0, 0, 0, 0],
    [1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0]
]

col_size = len(maze[0])
row_size = len(maze)


def get_movement(action):
    match action:
        case "U": return (0, -1)
        case "D": return (0, 1)
        case "L": return (-1, 0)
        case "R": return (1, 0)
        case _: return (0, 0)  # the default case


def get_position(position, move):
    new_position = (position[0] + move[0], position[1] + move[1])
    new_position = ((new_position[0] + col_size) % col_size,
                    (new_position[1] + row_size) % row_size)

    return new_position if maze[new_position[1]][new_position[0]] == 0 else position


player1 = (0, 0)
player2 = (len(maze) - 1, len(maze[0]) - 1)

while not player1 == player2:
    print(f"Player 1 is on: {player1}")
    print(f"Player 2 is on: {player2}")

    action1 = input("Enter the action for player 1 (U, D, L, R): ")
    action2 = input("Enter the action for player 2 (U, D, L, R): ")

    player1 = get_position(player1, get_movement(action1))
    player2 = get_position(player2, get_movement(action2))

print(f"They met at: {player1}")
