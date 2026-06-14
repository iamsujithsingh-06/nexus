const MemoryManager = require('../memory/manager/memoryManager');

const PROJECT_INDICATORS = [
  /(?:building|creating|developing|working on|starting) (?:a|an|the) ([^.\n]+)/i,
  /(?:project|app|application|system|platform|tool) called (.+?)(?:\.|,|$)/i,
  /(?:using|with) (react|node|python|django|flask|express|next|vue|angular|mongodb|postgres|docker|kubernetes|aws|gcp|azure)/i,
  /(?:tech stack|stack|technology).+?([^.\n]+)/i,
];

class ProjectIntelligence {
  async detectInMessage(userId, message) {
    let projectName = null;
    let techStack = null;

    for (const regex of PROJECT_INDICATORS) {
      const match = message.match(regex);
      if (match) {
        if (!projectName && match[1]) {
          projectName = match[1].trim();
        }
        if (!techStack) {
          const tech = match[1]?.toLowerCase();
          if (['react', 'node', 'python', 'django', 'flask', 'express', 'next', 'vue', 'angular', 'mongodb', 'postgres', 'docker', 'kubernetes', 'aws', 'gcp', 'azure'].includes(tech)) {
            techStack = tech;
          }
        }
      }
    }

    if (projectName || techStack) {
      await this._storeDetection(userId, projectName, techStack, message);
    }

    return { projectName, techStack };
  }

  async _storeDetection(userId, projectName, techStack, message) {
    const timestamp = Date.now();

    if (projectName) {
      const key = `project:${projectName.toLowerCase().replace(/\s+/g, '_')}`;
      const existing = await MemoryManager.getMemory(userId, key);

      if (existing) {
        await MemoryManager.updateMemory(userId, key, {
          value: {
            ...existing.value,
            lastMentioned: new Date(),
            mentionCount: (existing.value.mentionCount || 1) + 1,
          },
        });
      } else {
        await MemoryManager.addMemory(
          userId,
          'project',
          key,
          {
            name: projectName,
            stage: 'ideation',
            status: 'active',
            firstMentioned: new Date(),
            lastMentioned: new Date(),
            mentionCount: 1,
            techStack: techStack || null,
          },
          { priority: 6, tags: ['project', 'active'] }
        );
      }
    }

    if (techStack) {
      const techKey = `skill:${techStack}`;
      const existingTech = await MemoryManager.getMemory(userId, techKey);

      if (!existingTech) {
        await MemoryManager.addMemory(
          userId,
          'skill',
          techKey,
          { name: techStack, proficiency: 'learning', status: 'in_progress' },
          { priority: 4, tags: ['skill', 'technology'] }
        );
      }
    }
  }

  async getActiveProjectsContext(userId) {
    try {
      const projects = await MemoryManager.getActiveProjects(userId);
      if (!projects || !projects.length) return null;

      return projects
        .map((p) => {
          const v = p.value;
          return `${v.name || p.key.replace('project:', '')} [${v.stage || 'active'}]${v.techStack ? ` (${v.techStack})` : ''}`;
        })
        .join(', ');
    } catch {
      return null;
    }
  }

  async updateProjectStage(userId, projectName, stage) {
    const key = `project:${projectName.toLowerCase().replace(/\s+/g, '_')}`;
    await MemoryManager.updateMemory(userId, key, {
      value: { stage },
    });
  }

  async markProjectComplete(userId, projectName) {
    const key = `project:${projectName.toLowerCase().replace(/\s+/g, '_')}`;
    await MemoryManager.updateMemory(userId, key, {
      value: { status: 'completed', stage: 'completed' },
    });
  }
}

module.exports = new ProjectIntelligence();
