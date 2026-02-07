# 1. Node.js පදනම් කරගත් image එකක් තෝරාගන්නවා
FROM node:18

# 2. වැඩ කරන folder එක හදනවා
WORKDIR /app

# 3. Dependencies ටික කලින්ම copy කරගන්නවා
COPY package*.json ./

# 4. Libraries install කරනවා
RUN npm install

# 5. ඉතිරි සියලුම code ටික copy කරනවා
COPY . .

# 6. Backend එක run වෙන port එක (ඔයාගේ 5001 නේද?)
EXPOSE 5001

# 7. Server එක පණගන්වන command එක
CMD ["npm", "start"]