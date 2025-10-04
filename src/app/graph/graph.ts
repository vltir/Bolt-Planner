import {Component, Input, OnInit} from '@angular/core';

export interface NodeModel {
  id: string;
  x: number;
  y: number;
}

export interface EdgeModel {
  from: string;
  to: string;
}

export interface GraphModel {
  nodes: NodeModel[];
  edges: EdgeModel[];
}

@Component({
  selector: 'app-graph',
  standalone: true,
  templateUrl: './graph.html',
  imports: [],
  styleUrl: './graph.css'
})
export class Graph implements OnInit {

  @Input() graph!: GraphModel;
  minX!: number;
  maxX!: number;
  minY!: number;
  maxY!: number;

  ngOnInit() {
    const xs = this.graph.nodes.map(n=>n.x);
    const ys = this.graph.nodes.map(n=>n.y);
    this.minX = Math.min(...xs);
    this.maxX = Math.max(...xs);
    this.minY = Math.min(...ys);
    this.maxY = Math.max(...ys);
  }

  getEdgePath(edge: EdgeModel): string {
    const from = this.graph.nodes.find(n => n.id === edge.from)!;
    const to = this.graph.nodes.find(n => n.id === edge.to)!;
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    // direkte Verbindung bei waagrecht, senkrecht oder diagonal
    if (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) {
      return `M ${from.x},${from.y} L ${to.x},${to.y}`;
    }

    // ansonsten Knick über den maximal möglichen Diagonal-Schritt
    const step = Math.min(Math.abs(dx), Math.abs(dy));
    const midX = from.x + Math.sign(dx) * step;
    const midY = from.y + Math.sign(dy) * step;

    return `M ${from.x},${from.y} L ${midX},${midY} L ${to.x},${to.y}`;
  }

  getEdgePathalt(edge: EdgeModel): string {
    const from = this.graph.nodes.find(n => n.id === edge.from)!;
    const to = this.graph.nodes.find(n => n.id === edge.to)!;
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    // Start-Punkt setzen (MoveTo-Kommando)
    let pathData = `M ${from.x},${from.y}`;

    // 1. Fall: Direkte Verbindung möglich (waagrecht, senkrecht oder volle Diagonale)
    if (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) {
      return `${pathData} L ${to.x},${to.y}`;
    }

    // --- 2. Fall: Knick über den maximal möglichen Diagonal-Schritt (inkl. halbem Start-Offset) ---

    const signX = Math.sign(dx);
    const signY = Math.sign(dy);
    const startStepLength = 0.5; // Die geforderte halbe Einheit

    let currentX = from.x;
    let currentY = from.y;

    // Bestimme, welche Achse die DOMINANTE Distanz hat
    const isXDominant = Math.abs(dx) > Math.abs(dy);

    // ********** GEÄNDERTE LOGIK FÜR DEN HOOK (Kreuzungsvermeidung) **********
    // Der Hook wird nun entlang der dominanten Achse gesetzt.
    // Dies trennt Kanten, die in verschiedene Quadranten verlaufen, besser.
    if (isXDominant) {
      // X ist dominant (z.B. 4 vs 2). Starte mit X-Hook (horizontal).
      currentX = from.x + signX * startStepLength;
      pathData += ` L ${currentX},${currentY}`;
    } else {
      // Y ist dominant (oder gleich, z.B. 1 vs 3). Starte mit Y-Hook (vertikal).
      currentY = from.y + signY * startStepLength;
      pathData += ` L ${currentX},${currentY}`;
    }
    // *************************************************************************


    // Verbleibende Differenzen nach dem Start-Offset
    const remainingDx = to.x - currentX;
    const remainingDy = to.y - currentY;

    // 2. Segment: Maximal möglicher diagonaler Zug
    const diagonalStep = Math.min(Math.abs(remainingDx), Math.abs(remainingDy));

    // Wichtig: Die Zeichen der verbleibenden Differenzen verwenden!
    currentX += Math.sign(remainingDx) * diagonalStep;
    currentY += Math.sign(remainingDy) * diagonalStep;

    pathData += ` L ${currentX},${currentY}`;

    // 3. Segment: Restlicher achsenparalleler Zug zum Zielpunkt
    pathData += ` L ${to.x},${to.y}`;

    return pathData;
  }

  onNodeClick(node: NodeModel) {
    console.log('Knoten angeklickt:', node.id);
    console.log(Math.min(...this.graph.nodes.map(n=>n.x)));
  }

  viewBox() {
    return `${this.minX - 0.5} ${this.minY - 0.5} ${this.maxX - this.minX + 1} ${this.maxY - this.minY + 1}`;
  }
}
