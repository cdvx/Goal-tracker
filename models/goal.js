
const goal = (sequelize, DataTypes) => {
    const Goal = sequelize.define('goal', {
      text: DataTypes.STRING,
    });
  
    Goal.associate = models => {
      Goal.belongsTo(models.User);
    };
  
    return Goal;
  };
  
  export default goal;