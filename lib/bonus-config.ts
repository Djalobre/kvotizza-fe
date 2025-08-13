import type {
    BookieBonusConfig,
    BonusThreshold,
    ConditionalBonusThreshold,
    BetSelection,
    BonusCalculation,
  } from "../types/bookies"
  
  export const BONUS_CONFIGS: BookieBonusConfig[] = [
    {
      bookie: "Pinnbet",
      displayName: "Pinnbet Accumulator Bonus",
      description: "Get bonus on accumulator bets with qualifying odds",
      thresholds: [
        { minMatches: 5, minOdds: 1.35, bonusPercentage: 3 },
        { minMatches: 6, minOdds: 1.35, bonusPercentage: 5 },
        { minMatches: 7, minOdds: 1.35, bonusPercentage: 7 },
        { minMatches: 8, minOdds: 1.35, bonusPercentage: 10 },
        { minMatches: 9, minOdds: 1.35, bonusPercentage: 12 },
        { minMatches: 10, minOdds: 1.35, bonusPercentage: 15 },
      ],
    },
    {
      bookie: "Betole",
      displayName: "Betole Accumulator Bonus",
      description: "Accumulator bonus for multiple selections",
      thresholds: [
        { minMatches: 5, minOdds: 1.35, bonusPercentage: 5 },
        { minMatches: 6, minOdds: 1.35, bonusPercentage: 7 },
        { minMatches: 7, minOdds: 1.35, bonusPercentage: 10 },
        { minMatches: 8, minOdds: 1.35, bonusPercentage: 12 },
        { minMatches: 9, minOdds: 1.35, bonusPercentage: 15 },
        { minMatches: 10, minOdds: 1.35, bonusPercentage: 20 },
      ],
    },
    {
      bookie: "Mozzartbet",
      displayName: "Mozzartbet Conditional Bonus",
      description: "Higher bonuses available when avoiding Konacni ishod bets",
      hasConditionalBonuses: true,
      thresholds: [
        {
          minMatches: 5,
          minOdds: 1.35,
          bonusPercentage: 3, // Higher bonus if no "Konacni ishod" bets
          alternativePercentage: 2, // Lower bonus if "Konacni ishod" bets are included
          condition: "exclude",
          excludeCategories: ["Konačni ishod"],
          conditionDescription: "Higher bonus (8%) when avoiding Konacni ishod bets, otherwise 2%",
        },
        {
          minMatches: 6,
          minOdds: 1.35,
          bonusPercentage: 5,
          alternativePercentage: 5,
          condition: "exclude",
          excludeCategories: ["Konačni ishod"],
          conditionDescription: "Higher bonus (12%) when avoiding Konacni ishod bets, otherwise 5%",
        },
        {
          minMatches: 7,
          minOdds: 1.35,
          bonusPercentage: 10,
          alternativePercentage: 7,
          condition: "exclude",
          excludeCategories: ["Konačni ishod"],
          conditionDescription: "Higher bonus (15%) when avoiding Konacni ishod bets, otherwise 7%",
        }
      ],
    },
  ]
  
  export class BonusCalculatorService {
    private static instance: BonusCalculatorService
  
    private constructor() {}
  
    static getInstance(): BonusCalculatorService {
      if (!BonusCalculatorService.instance) {
        BonusCalculatorService.instance = new BonusCalculatorService()
      }
      return BonusCalculatorService.instance
    }
  
    // Get bonus config for a specific bookie
    getBonusConfig(bookie: string): BookieBonusConfig | null {
      return BONUS_CONFIGS.find((config) => config.bookie === bookie) || null
    }
  
    // Get all available bonus configs
    getAllBonusConfigs(): BookieBonusConfig[] {
      return BONUS_CONFIGS
    }
  
    // Check if threshold condition is met
    private checkThresholdCondition(
      threshold: ConditionalBonusThreshold,
      selections: BetSelection[],
    ): { conditionMet: boolean; actualPercentage: number } {
      if (!threshold.condition || (!threshold.excludeCategories && !threshold.includeCategories)) {
        return { conditionMet: true, actualPercentage: threshold.bonusPercentage }
      }
  
      if (threshold.condition === "exclude" && threshold.excludeCategories) {
        // Check if any selection is from excluded categories
        const hasExcludedCategory = selections.some((selection) =>
          threshold.excludeCategories!.includes(selection.category),
        )
  
        if (hasExcludedCategory) {
          // Condition not met, use alternative percentage
          return {
            conditionMet: false,
            actualPercentage: threshold.alternativePercentage || threshold.bonusPercentage,
          }
        } else {
          // Condition met, use main percentage
          return { conditionMet: true, actualPercentage: threshold.bonusPercentage }
        }
      }
  
      if (threshold.condition === "include" && threshold.includeCategories) {
        // Check if any selection is from included categories
        const hasIncludedCategory = selections.some((selection) =>
          threshold.includeCategories!.includes(selection.category),
        )
  
        if (hasIncludedCategory) {
          // Condition met, use main percentage
          return { conditionMet: true, actualPercentage: threshold.bonusPercentage }
        } else {
          // Condition not met, use alternative percentage
          return {
            conditionMet: false,
            actualPercentage: threshold.alternativePercentage || threshold.bonusPercentage,
          }
        }
      }
  
      return { conditionMet: true, actualPercentage: threshold.bonusPercentage }
    }
  
    // Calculate bonus for selections from a specific bookie
    calculateBonusForBookie(selections: BetSelection[], bookie: string, stake: number): BonusCalculation {
      const bonusConfig = this.getBonusConfig(bookie)
      if (!bonusConfig) {
        return {
          qualifyingSelections: [],
          appliedThreshold: null,
          bonusAmount: 0,
          bonusPercentage: 0,
          totalQualifyingOdds: 1,
        }
      }
  
      // Filter selections for this bookie
      const bookieSelections = selections.filter((selection) => selection.bookie === bookie)
  
      // Find the highest applicable threshold
      let appliedThreshold: BonusThreshold | ConditionalBonusThreshold | null = null
      let actualBonusPercentage = 0
      let conditionMet = true
      let conditionDescription = ""
  
      for (const threshold of bonusConfig.thresholds.sort((a, b) => b.minMatches - a.minMatches)) {
        const qualifyingSelections = bookieSelections.filter((selection) => selection.odds >= threshold.minOdds)
  
        if (qualifyingSelections.length >= threshold.minMatches) {
          // Check if this is a conditional threshold
          if ("condition" in threshold && threshold.condition) {
            const conditionResult = this.checkThresholdCondition(threshold, bookieSelections)
            actualBonusPercentage = conditionResult.actualPercentage
            conditionMet = conditionResult.conditionMet
            conditionDescription = threshold.conditionDescription || ""
          } else {
            actualBonusPercentage = threshold.bonusPercentage
          }
  
          appliedThreshold = threshold
          break
        }
      }
  
      if (!appliedThreshold) {
        return {
          qualifyingSelections: [],
          appliedThreshold: null,
          bonusAmount: 0,
          bonusPercentage: 0,
          totalQualifyingOdds: 1,
        }
      }
  
      // Calculate qualifying selections and total odds
      const qualifyingSelections = bookieSelections.filter((selection) => selection.odds >= appliedThreshold.minOdds)
  
      const totalQualifyingOdds = qualifyingSelections.reduce((acc, selection) => acc * selection.odds, 1)
      const potentialWin = stake * totalQualifyingOdds
      const bonusAmount = (potentialWin * actualBonusPercentage) / 100
  
      return {
        qualifyingSelections,
        appliedThreshold,
        bonusAmount,
        bonusPercentage: actualBonusPercentage,
        totalQualifyingOdds,
        conditionMet,
        conditionDescription,
      }
    }
  
    // Calculate all available bonuses for mixed selections
    calculateAllBonuses(selections: BetSelection[], stake: number): { [bookie: string]: BonusCalculation } {
      const bonusByBookie: { [bookie: string]: BonusCalculation } = {}
  
      // Group selections by bookie
      const selectionsByBookie = selections.reduce(
        (acc, selection) => {
          if (!acc[selection.bookie]) {
            acc[selection.bookie] = []
          }
          acc[selection.bookie].push(selection)
          return acc
        },
        {} as { [bookie: string]: BetSelection[] },
      )
  
      // Calculate bonus for each bookie
      Object.keys(selectionsByBookie).forEach((bookie) => {
        const bonus = this.calculateBonusForBookie(selections, bookie, stake)
        if (bonus.bonusAmount > 0) {
          bonusByBookie[bookie] = bonus
        }
      })
  
      return bonusByBookie
    }
  
    // Get the best bonus available
    getBestBonus(selections: BetSelection[], stake: number): { bookie: string; bonus: BonusCalculation } | null {
      const allBonuses = this.calculateAllBonuses(selections, stake)
  
      let bestBonus = null
      let bestBonusAmount = 0
  
      Object.entries(allBonuses).forEach(([bookie, bonus]) => {
        if (bonus.bonusAmount > bestBonusAmount) {
          bestBonusAmount = bonus.bonusAmount
          bestBonus = { bookie, bonus }
        }
      })
  
      return bestBonus
    }
  
    // Get potential bonus improvements (what user could get if they change their selections)
    getBonusOptimizationSuggestions(
      selections: BetSelection[],
      stake: number,
    ): Array<{
      bookie: string
      suggestion: string
      potentialBonus: number
      currentBonus: number
    }> {
      const suggestions: Array<{
        bookie: string
        suggestion: string
        potentialBonus: number
        currentBonus: number
      }> = []
  
      // Check each bookie's potential
      BONUS_CONFIGS.forEach((config) => {
        const currentBonus = this.calculateBonusForBookie(selections, config.bookie, stake)
  
        // Check if there are conditional bonuses that could be optimized
        if (config.hasConditionalBonuses) {
          const bookieSelections = selections.filter((s) => s.bookie === config.bookie)
  
          config.thresholds.forEach((threshold) => {
            if ("condition" in threshold && threshold.condition === "exclude" && threshold.excludeCategories) {
              const hasExcludedCategory = bookieSelections.some((selection) =>
                threshold.excludeCategories!.includes(selection.category),
              )
  
              if (hasExcludedCategory && bookieSelections.length >= threshold.minMatches) {
                const qualifyingSelections = bookieSelections.filter((s) => s.odds >= threshold.minOdds)
                if (qualifyingSelections.length >= threshold.minMatches) {
                  const totalOdds = qualifyingSelections.reduce((acc, s) => acc * s.odds, 1)
                  const potentialWin = stake * totalOdds
                  const potentialBonus = (potentialWin * threshold.bonusPercentage) / 100
  
                  suggestions.push({
                    bookie: config.bookie,
                    suggestion: `Remove ${threshold.excludeCategories.join(", ")} bets to get ${threshold.bonusPercentage}% bonus instead of ${threshold.alternativePercentage || 0}%`,
                    potentialBonus,
                    currentBonus: currentBonus.bonusAmount,
                  })
                }
              }
            }
          })
        }
      })
  
      return suggestions.filter((s) => s.potentialBonus > s.currentBonus)
    }
  }
  
  export const bonusCalculatorService = BonusCalculatorService.getInstance()
  