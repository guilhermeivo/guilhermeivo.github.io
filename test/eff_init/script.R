source("../common.R")

# BEGIN VARS
tests <- c("TEST_1", "TEST_2", "TEST_3", "TEST_4")
levels <- c("0", "3", "s")
levels_description <- c(
    "Otimizar para velocidade de compilação - sem otimização de código (padrão)",
    "Otimizar para aumentar a velocidade de execução do código",
    "Otimizar para o tamanho do arquivo"
)
colors <- grey.colors(length(levels), start=0.25, end=0.9)
labels <- c(
    "Laço de repetição\nfor (...) { e[i] = _; }", 
    "Manual\ne[0] = _; e[1] = _; ...",
    "Preencher todos\nfloat e[16]{ _, _, ... };",
    "Preencher manual\nfloat e[16] = { _, _, ... };")

# END VARS

if (length(levels) != length(levels_description)) {
    print("length(levels) != length(levels_description)")
    exit()
}
if (length(tests) != length(labels)) {
    print("length(tests) != length(labels)")
    exit()
}
total <- length(tests) * length(levels)
parts <- total / length(levels)
spaces <- total / parts
for (i in seq(from=2,to=(total+spaces),by=4)) {
    axis_at <- c(axis_at, i)
}
# BEGIN BOXPLOT

pdf(file = paste("generated/boxplot", ".pdf", sep = ""),
    width = 10,
    height = 6,
    family = "serif")
nf <- layout(matrix(c(
    1, 1, 1,
    2, 2, 2,
    2, 2, 2,
    3, 3, 3,
    3, 3, 3,
    3, 3, 3,
    3, 3, 3,
    4, 4, 4), nrow=8, byrow=TRUE))
#layout.show(nf)

par(mar=c(0, 3, 1, 3))
plot.new()

mtext(substitute(bold(atop(
"Inicialização de Array com 16 posições do",
"tipo float (float e[16]) usando compilador GCC e " ~ version)), 
list(version=version)), side = 3, line = -3, cex = 0.75)
legend_level <- c()
for (level in levels) {
    legend_level <- c(legend_level, paste("-O", level, sep = ""))
}
legend("topright", legend = legend_level, fill = colors)

par(mar=c(3, 5, 0, 3))

breaks_plot <- c()
for (i in 1:(total + spaces)) {
    if (i %% parts) {
        breaks_plot <- c(breaks_plot, i)
    }
}
size_data <- read.delim(paste("data/", "size", ".dat", sep = ""))
plot(
    breaks_plot, 
    size_data$size,
    main = NULL, bty="n", 
    xlab = "", ylab = "Tamanho Arquivo (byte)", xaxt="n", xlim=c(0.5,15.5))

list_item <- list()
for (test in tests) {
    for (level in levels) {
        test_data <- read.delim(paste("data/", test, "__", level, ".dat", sep = ""))
        list_item <- append(list_item, list(remove_outliers(test_data$time)))
    }
    if (test != tests[4]) {
        list_item <- append(list_item, list(c()))
    }
}
create_boxplot("nanosegundos", list_item)

plot.new()
description <- paste(
    "Removido valores atípicos (outliers)",
    sep = "")
for (i in 1:length(levels)) {
    description <- paste(description, "\n",
        "-O", levels[i], " ", levels_description[i],
    sep = "")
}
mtext(description, side = 1, line = 1, cex = 0.75, adj = 0)
mtext(readLines("data/max.txt"), side = 1, line = 1, cex = 0.75, adj = 1)
dev.off()
# END BOXPLOT