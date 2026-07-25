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
    async loadFindings({ treeId = "", verificationStatus = "" } = {}) {
      const query = new URLSearchParams();
      if (treeId) query.set("treeId", treeId);
      if (verificationStatus) query.set("verificationStatus", verificationStatus);
      const result = await request(`/v1/findings${query.size ? `?${query}` : ""}`);
      return result.findings || [];
    },
    async loadVerifiedFindings() {
      return this.loadFindings({ verificationStatus: "verified" });
    },
    async verifyFinding(id, status = "verified", reviewer = "orangetrees") {
      const result = await request(`/v1/findings/${encodeURIComponent(id)}/verification`, {
        method: "PATCH",
        body: JSON.stringify({ status, reviewer })
      });
      return result.finding;
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
