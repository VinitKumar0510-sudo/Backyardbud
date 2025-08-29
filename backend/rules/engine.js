const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class RulesEngine {
  constructor() {
    this.rules = this.loadRules();
  }

  loadRules() {
    try {
      const rulesPath = path.join(__dirname, '../../rules/sepp-part2.json');
      const rulesData = fs.readFileSync(rulesPath, 'utf8');
      return JSON.parse(rulesData);
    } catch (error) {
      console.error('Error loading rules:', error);
      return {};
    }
  }

  assessProposal(property, proposal) {
    const structureType = proposal.structureType.toLowerCase();
    const rules = this.rules[structureType];

    if (!rules) {
      return {
        recommendation: 'not_exempt',
        reasoning: `No rules found for structure type: ${proposal.structureType}`,
        clauses: [],
        conditions: [],
        failedConditions: [`Unsupported structure type: ${proposal.structureType}`]
      };
    }

    const results = {
      recommendation: 'exempt',
      reasoning: '',
      clauses: [],
      conditions: [],
      failedConditions: []
    };

    // Check each rule condition
    for (const [ruleKey, rule] of Object.entries(rules)) {
      const conditionResult = this.evaluateCondition(rule.condition, property, proposal);
      
      if (conditionResult.passed) {
        results.conditions.push(conditionResult.description);
        results.clauses.push(rule.clause);
      } else {
        results.failedConditions.push(conditionResult.description);
        results.recommendation = 'not_exempt';
      }
    }

    // Set reasoning based on result
    if (results.recommendation === 'exempt') {
      results.reasoning = 'Proposal meets all SEPP Part 2 criteria for exempt development';
    } else {
      results.reasoning = 'Proposal does not meet SEPP Part 2 criteria for exempt development';
    }

    return results;
  }

  evaluateCondition(condition, property, proposal) {
    try {
      // Create a safe evaluation context
      const context = {
        ...property,
        ...proposal,
        // Helper functions
        Math: Math
      };

      // Simple condition evaluation (in production, use a proper expression parser)
      const result = this.safeEval(condition, context);
      
      return {
        passed: result,
        description: this.getConditionDescription(condition, context, result)
      };
    } catch (error) {
      console.error('Error evaluating condition:', condition, error);
      return {
        passed: false,
        description: `Error evaluating condition: ${condition}`
      };
    }
  }

  safeEval(expression, context) {
    // Replace variables in expression with values from context
    let evalExpression = expression;
    
    for (const [key, value] of Object.entries(context)) {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      evalExpression = evalExpression.replace(regex, value);
    }

    // Basic safety check - only allow simple mathematical and comparison operations
    if (!/^[\d\s+\-*/.()<=>&|!]+$/.test(evalExpression)) {
      throw new Error('Unsafe expression');
    }

    return eval(evalExpression);
  }

  getConditionDescription(condition, context, result) {
    // Generate human-readable description of the condition check
    const status = result ? '✓' : '✗';
    
    // Simple mapping of common conditions to descriptions
    if (condition.includes('height')) {
      return `${status} Structure height (${context.height}m) ${result ? 'meets' : 'exceeds'} height limit`;
    }
    if (condition.includes('floorArea')) {
      return `${status} Floor area (${context.floorArea}m²) ${result ? 'meets' : 'exceeds'} area limit`;
    }
    if (condition.includes('distanceFromBoundary')) {
      return `${status} Boundary setback (${context.distanceFromBoundary}m) ${result ? 'meets' : 'fails'} minimum requirement`;
    }
    if (condition.includes('lotSize')) {
      return `${status} Lot size (${context.lotSize}m²) ${result ? 'meets' : 'fails'} minimum requirement`;
    }

    return `${status} ${condition} - ${result ? 'Passed' : 'Failed'}`;
  }

  getRules() {
    return this.rules;
  }

  reloadRules() {
    this.rules = this.loadRules();
    return this.rules;
  }
}

module.exports = RulesEngine;
