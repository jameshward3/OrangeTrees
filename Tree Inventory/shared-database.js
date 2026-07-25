(function () {
  const baseUrl = String(window.ORANGE_TREE_DATABASE_URL || "").replace(/\/$/, "");

  async function request(path, options = {}) {
    const response = await fetch(baseUrl + path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });
    if (!response.ok) {
      throw new Error(`OrangeTreeDatabase request failed (${response.status})`);
    }
    return response.status === 204 ? null : response.json();
  }

  window.orangeTreeDatabase = {
    baseUrl,
    async loadTrees() {
      const result = await request("/v1/trees?includeArchived=true");
      return result.trees || [];
    },
    async saveTree(tree) {
      const result = await request(`/v1/trees/${encodeURIComponent(tree.id)}`, {
        method: "PUT",
        body: JSON.stringify({ ...tree, source: "orangetrees" })
      });
      return result.tree;
    },
    async saveTrees(trees) {
      return Promise.all(trees.map(tree => this.saveTree(tree)));
    },
    async archiveTree(id) {
      return request(`/v1/trees/${encodeURIComponent(id)}`, { method: "DELETE" });
    }
  };
})();
