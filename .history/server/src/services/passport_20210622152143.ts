import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { sequelize } from "../database";

export const jwtLogin = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  },
  async (jwt_payload, done) => {
    try {
      const result = await sequelize.models.User.findOne({
        where: { id: jwt_payload.id },
      });
      if (result) {
        const user = result.dataValues;
        return done(null, user);
      }

      return done(null, false);
    } catch (error) {
      console.log(error);
    }
  }
);