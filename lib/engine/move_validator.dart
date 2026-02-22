import 'models.dart';
import 'board.dart';

class MoveValidator {
  static bool isValidMove(Board board, Position from, Position to, PieceColor currentTurn) {
    if (!from.isValid() || !to.isValid()) return false;
    final piece = board.getPieceAt(from);
    if (piece == null || piece.color != currentTurn) return false;

    final targetPiece = board.getPieceAt(to);
    if (targetPiece != null && targetPiece.color == currentTurn) return false;

    final dx = (to.x - from.x).abs();
    final dy = (to.y - from.y).abs();

    switch (piece.type) {
      case PieceType.king:
        return _isValidKingMove(from, to, dx, dy, piece.color);
      case PieceType.advisor:
        return _isValidAdvisorMove(from, to, dx, dy, piece.color);
      case PieceType.elephant:
        return _isValidElephantMove(board, from, to, dx, dy, piece.color);
      case PieceType.horse:
        return _isValidHorseMove(board, from, to, dx, dy);
      case PieceType.chariot:
        return _isValidChariotMove(board, from, to, dx, dy);
      case PieceType.cannon:
        return _isValidCannonMove(board, from, to, dx, dy);
      case PieceType.soldier:
        return _isValidSoldierMove(from, to, dx, dy, piece.color);
    }
  }

  static bool _isValidKingMove(Position from, Position to, int dx, int dy, PieceColor color) {
    // Must be in palace
    if (to.x < 3 || to.x > 5) return false;
    if (color == PieceColor.red) {
      if (to.y > 2) return false;
    } else {
      if (to.y < 7) return false;
    }
    return (dx == 1 && dy == 0) || (dx == 0 && dy == 1);
  }

  static bool _isValidAdvisorMove(Position from, Position to, int dx, int dy, PieceColor color) {
    // Must be in palace
    if (to.x < 3 || to.x > 5) return false;
    if (color == PieceColor.red) {
      if (to.y > 2) return false;
    } else {
      if (to.y < 7) return false;
    }
    return dx == 1 && dy == 1;
  }

  static bool _isValidElephantMove(Board board, Position from, Position to, int dx, int dy, PieceColor color) {
    if (dx != 2 || dy != 2) return false;
    // Cannot cross river
    if (color == PieceColor.red && to.y > 4) return false;
    if (color == PieceColor.black && to.y < 5) return false;
    // Eye must be clear
    final eye = Position((from.x + to.x) ~/ 2, (from.y + to.y) ~/ 2);
    return !board.isOccupied(eye);
  }

  static bool _isValidHorseMove(Board board, Position from, Position to, int dx, int dy) {
    if (!((dx == 1 && dy == 2) || (dx == 2 && dy == 1))) return false;
    // Check horse leg
    Position leg;
    if (dx == 1) {
      leg = Position(from.x, (from.y + to.y) ~/ 2);
    } else {
      leg = Position((from.x + to.x) ~/ 2, from.y);
    }
    return !board.isOccupied(leg);
  }

  static bool _isValidChariotMove(Board board, Position from, Position to, int dx, int dy) {
    if (dx != 0 && dy != 0) return false;
    return _countPiecesBetween(board, from, to) == 0;
  }

  static bool _isValidCannonMove(Board board, Position from, Position to, int dx, int dy) {
    if (dx != 0 && dy != 0) return false;
    final count = _countPiecesBetween(board, from, to);
    if (!board.isOccupied(to)) {
      return count == 0;
    } else {
      return count == 1;
    }
  }

  static bool _isValidSoldierMove(Position from, Position to, int dx, int dy, PieceColor color) {
    final forward = (color == PieceColor.red) ? 1 : -1;
    final isCrossedRiver = (color == PieceColor.red) ? from.y > 4 : from.y < 5;

    if (dx == 0 && (to.y - from.y) == forward) return true;
    if (isCrossedRiver && dy == 0 && dx == 1) return true;
    return false;
  }

  static int _countPiecesBetween(Board board, Position from, Position to) {
    int count = 0;
    if (from.x == to.x) {
      final minY = from.y < to.y ? from.y : to.y;
      final maxY = from.y > to.y ? from.y : to.y;
      for (int y = minY + 1; y < maxY; y++) {
        if (board.isOccupied(Position(from.x, y))) count++;
      }
    } else if (from.y == to.y) {
      final minX = from.x < to.x ? from.x : to.x;
      final maxX = from.x > to.x ? from.x : to.x;
      for (int x = minX + 1; x < maxX; x++) {
        if (board.isOccupied(Position(x, from.y))) count++;
      }
    }
    return count;
  }
}
