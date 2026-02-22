enum PieceColor { red, black }

enum PieceType { 
  king,      // 將/帥
  advisor,   // 士/仕
  elephant,  // 象/相
  horse,     // 馬/傌
  chariot,   // 車/俥 (Rook)
  cannon,    // 炮/砲
  soldier    // 卒/兵 (Pawn)
}

class Position {
  final int x; // 0-8
  final int y; // 0-9

  const Position(this.x, this.y);

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Position && runtimeType == other.runtimeType && x == other.x && y == other.y;

  @override
  int get hashCode => x.hashCode ^ y.hashCode;

  @override
  String toString() => '($x, $y)';

  bool isValid() => x >= 0 && x <= 8 && y >= 0 && y <= 9;
}

class Piece {
  final PieceColor color;
  final PieceType type;

  const Piece(this.color, this.type);

  String get name {
    switch (type) {
      case PieceType.king: return color == PieceColor.red ? '帥' : '將';
      case PieceType.advisor: return color == PieceColor.red ? '仕' : '士';
      case PieceType.elephant: return color == PieceColor.red ? '相' : '象';
      case PieceType.horse: return color == PieceColor.red ? '傌' : '馬';
      case PieceType.chariot: return color == PieceColor.red ? '俥' : '車';
      case PieceType.cannon: return color == PieceColor.red ? '砲' : '炮';
      case PieceType.soldier: return color == PieceColor.red ? '兵' : '卒';
    }
  }
}

class Move {
  final Position from;
  final Position to;
  final Piece? capturedPiece;

  Move({required this.from, required this.to, this.capturedPiece});
}
