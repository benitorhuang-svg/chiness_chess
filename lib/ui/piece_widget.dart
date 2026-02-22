import 'package:flutter/material.dart';
import '../engine/models.dart';

class PieceWidget extends StatelessWidget {
  final Piece piece;
  final bool isSelected;
  final VoidCallback onTap;

  const PieceWidget({
    Key? key,
    required this.piece,
    this.isSelected = false,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final color = piece.color == PieceColor.red ? Colors.red[900] : Colors.black;
    final bgColor = Colors.orange[100];

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: bgColor,
          shape: BoxShape.circle,
          border: Border.all(
            color: isSelected ? Colors.blue : Colors.brown[700]!,
            width: isSelected ? 3.0 : 2.0,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 4,
              offset: const Offset(2, 2),
            ),
          ],
        ),
        child: Center(
          child: Text(
            piece.name,
            style: TextStyle(
              color: color,
              fontSize: 24,
              fontWeight: FontWeight.bold,
              fontFamily: 'Serif', // Traditional feel
            ),
          ),
        ),
      ),
    );
  }
}
