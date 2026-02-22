import 'models.dart';
import 'board.dart';
import 'move_validator.dart';

enum GameStatus { playing, redWin, blackWin, draw }

class GameState {
  final Board board;
  final PieceColor turn;
  final GameStatus status;
  final List<Move> history;

  GameState({
    required this.board,
    this.turn = PieceColor.red,
    this.status = GameStatus.playing,
    this.history = const [],
  });

  factory GameState.initial() => GameState(board: Board.initial());

  GameState makeMove(Position from, Position to) {
    if (status != GameStatus.playing) return this;
    if (!MoveValidator.isValidMove(board, from, to, turn)) return this;

    final capturedPiece = board.getPieceAt(to);
    final nextBoard = board.move(from, to);
    final nextTurn = (turn == PieceColor.red) ? PieceColor.black : PieceColor.red;
    
    // Check for win condition (king captured)
    GameStatus nextStatus = GameStatus.playing;
    if (capturedPiece?.type == PieceType.king) {
      nextStatus = (turn == PieceColor.red) ? GameStatus.redWin : GameStatus.blackWin;
    }

    // In Chinese Chess, normally you can't capture the king directly, it's checkmate.
    // But for a simple engine, checking if the king is gone after a valid move 
    // is a basic win condition. A more advanced version would check for checkmate.

    return GameState(
      board: nextBoard,
      turn: nextTurn,
      status: nextStatus,
      history: [...history, Move(from: from, to: to, capturedPiece: capturedPiece)],
    );
  }
}
