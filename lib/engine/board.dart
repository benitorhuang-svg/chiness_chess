import 'models.dart';

class Board {
  final Map<Position, Piece> pieces;

  Board({required this.pieces});

  factory Board.initial() {
    final Map<Position, Piece> pieces = {};

    // Helper to add pieces symmetrically
    void addSymmetric(int x, int y, PieceType type) {
      // Red (Bottom)
      pieces[Position(x, y)] = Piece(PieceColor.red, type);
      if (x != 4) pieces[Position(8 - x, y)] = Piece(PieceColor.red, type);

      // Black (Top)
      pieces[Position(x, 9 - y)] = Piece(PieceColor.black, type);
      if (x != 4) pieces[Position(8 - x, 9 - y)] = Piece(PieceColor.black, type);
    }

    // Chariots (車)
    addSymmetric(0, 0, PieceType.chariot);
    // Horses (馬)
    addSymmetric(1, 0, PieceType.horse);
    // Elephants (相/象)
    addSymmetric(2, 0, PieceType.elephant);
    // Advisors (仕/士)
    addSymmetric(3, 0, PieceType.advisor);
    // Kings (帥/將)
    addSymmetric(4, 0, PieceType.king);
    // Cannons (砲/炮)
    addSymmetric(1, 2, PieceType.cannon);
    // Soldiers (兵/卒)
    addSymmetric(0, 3, PieceType.soldier);
    addSymmetric(2, 3, PieceType.soldier);
    addSymmetric(4, 3, PieceType.soldier);

    return Board(pieces: pieces);
  }

  Piece? getPieceAt(Position pos) => pieces[pos];

  Board move(Position from, Position to) {
    final nextPieces = Map<Position, Piece>.from(pieces);
    final piece = nextPieces.remove(from);
    if (piece != null) {
      nextPieces[to] = piece;
    }
    return Board(pieces: nextPieces);
  }

  bool isOccupied(Position pos) => pieces.containsKey(pos);
}
