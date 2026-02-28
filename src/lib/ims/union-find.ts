/**
 * Union-Find (Disjoint Set Union) with path compression and union by rank.
 * Used to group EQUIVALENT clauses across standards into equivalence classes.
 */
export class UnionFind<T> {
  private parent = new Map<T, T>()
  private rank = new Map<T, number>()

  /** Add an element if not already tracked. */
  add(x: T): void {
    if (!this.parent.has(x)) {
      this.parent.set(x, x)
      this.rank.set(x, 0)
    }
  }

  /** Find the root representative with path compression. */
  find(x: T): T {
    this.add(x)
    let root = x
    while (this.parent.get(root) !== root) {
      root = this.parent.get(root)!
    }
    // Path compression
    let current = x
    while (current !== root) {
      const next = this.parent.get(current)!
      this.parent.set(current, root)
      current = next
    }
    return root
  }

  /** Union two elements by rank. */
  union(a: T, b: T): void {
    const rootA = this.find(a)
    const rootB = this.find(b)
    if (rootA === rootB) return

    const rankA = this.rank.get(rootA)!
    const rankB = this.rank.get(rootB)!

    if (rankA < rankB) {
      this.parent.set(rootA, rootB)
    } else if (rankA > rankB) {
      this.parent.set(rootB, rootA)
    } else {
      this.parent.set(rootB, rootA)
      this.rank.set(rootA, rankA + 1)
    }
  }

  /** Are two elements in the same set? */
  connected(a: T, b: T): boolean {
    return this.find(a) === this.find(b)
  }

  /** Return all equivalence classes as Map<root, Set<member>>. */
  getGroups(): Map<T, Set<T>> {
    const groups = new Map<T, Set<T>>()
    for (const item of this.parent.keys()) {
      const root = this.find(item)
      let group = groups.get(root)
      if (!group) {
        group = new Set<T>()
        groups.set(root, group)
      }
      group.add(item)
    }
    return groups
  }
}
