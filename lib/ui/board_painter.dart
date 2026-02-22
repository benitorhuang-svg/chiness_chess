import 'package:flutter/material.dart';

class ChessBoardPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.black
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;

    final cellWidth = size.width / 8;
    final cellHeight = size.height / 9;

    // Draw vertical lines
    for (int i = 0; i < 9; i++) {
      if (i == 0 || i == 8) {
        // Full side lines
        canvas.drawLine(
          Offset(i * cellWidth, 0),
          Offset(i * cellWidth, size.height),
          paint,
        );
      } else {
        // Top part
        canvas.drawLine(
          Offset(i * cellWidth, 0),
          Offset(i * cellWidth, 4 * cellHeight),
          paint,
        );
        // Bottom part
        canvas.drawLine(
          Offset(i * cellWidth, 5 * cellHeight),
          Offset(i * cellWidth, size.height),
          paint,
        );
      }
    }

    // Draw horizontal lines
    for (int i = 0; i < 10; i++) {
      canvas.drawLine(
        Offset(0, i * cellHeight),
        Offset(size.width, i * cellHeight),
        paint,
      );
    }

    // Draw Palaces (X lines)
    // Red Palace
    canvas.drawLine(Offset(3 * cellWidth, 0), Offset(5 * cellWidth, 2 * cellHeight), paint);
    canvas.drawLine(Offset(5 * cellWidth, 0), Offset(3 * cellWidth, 2 * cellHeight), paint);
    // Black Palace
    canvas.drawLine(Offset(3 * cellWidth, 7 * cellHeight), Offset(5 * cellWidth, 9 * cellHeight), paint);
    canvas.drawLine(Offset(5 * cellWidth, 7 * cellHeight), Offset(3 * cellWidth, 9 * cellHeight), paint);

    // Chu River Han Border Text (Simplified for Painter, or use TextPainter)
    _drawText(canvas, size, cellHeight);
  }

  void _drawText(Canvas canvas, Size size, double cellHeight) {
    final textStyle = TextStyle(
      color: Colors.black,
      fontSize: cellHeight * 0.4,
      fontWeight: FontWeight.bold,
    );

    void draw(String text, Offset offset, double angle) {
      final textSpan = TextSpan(text: text, style: textStyle);
      final textPainter = TextPainter(
        text: textSpan,
        textDirection: TextDirection.ltr,
      )..layout();

      canvas.save();
      canvas.translate(offset.dx, offset.dy);
      canvas.rotate(angle);
      textPainter.paint(canvas, Offset(-textPainter.width / 2, -textPainter.height / 2));
      canvas.restore();
    }

    // Draw "楚河" and "漢界"
    draw("楚 河", Offset(size.width * 0.25, size.height * 0.5), 0);
    draw("漢 界", Offset(size.width * 0.75, size.height * 0.5), 0);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
